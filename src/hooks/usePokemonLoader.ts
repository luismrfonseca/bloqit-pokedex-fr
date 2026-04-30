'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useIsRestoring } from '@tanstack/react-query';
import { fetchCompleteListRecursive, fetchPokemon } from '@/services/pokemonService';
import { PokemonListItem, Pokemon } from '@/types/pokemon';

export type LoadPhase = 'list' | 'details' | 'done';

export interface UsePokemonLoaderResult {
  list: PokemonListItem[];
  pokemonMap: Record<number, Pokemon>;
  phase: LoadPhase;
  total: number;
  detailsLoaded: number;
}

interface ListCache {
  items: PokemonListItem[];
  total: number;
}

const LIST_KEY = ['pokemon-list'] as const;

export function usePokemonLoader(): UsePokemonLoaderResult {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring(); // true while IDB is being hydrated

  const [list, setList] = useState<PokemonListItem[]>([]);
  const [pokemonMap, setPokemonMap] = useState<Record<number, Pokemon>>({});
  const [phase, setPhase] = useState<LoadPhase>('list');
  const [total, setTotal] = useState(0);
  const [detailsLoaded, setDetailsLoaded] = useState(0);

  useEffect(() => {
    if (isRestoring) return; // wait for IDB hydration before reading cache

    let cancelled = false;

    const run = async () => {
      // ── Phase 1: Complete list ─────────────────────────────────────────────
      let fullList: PokemonListItem[];

      const cachedList = queryClient.getQueryData<ListCache>(LIST_KEY);
      if (cachedList) {
        fullList = cachedList.items;
        setList(cachedList.items);
        setTotal(cachedList.total);
      } else {
        const accumulated: PokemonListItem[] = [];
        let apiTotal = 0;

        try {
          await fetchCompleteListRecursive((chunk, t) => {
            if (cancelled) return;
            accumulated.push(...chunk);
            apiTotal = t;
            setList([...accumulated]);
            setTotal(t);
          });
        } catch (error) {
          console.warn('Failed to fetch complete list:', error);
        }

        if (cancelled) return;

        fullList = accumulated;
        queryClient.setQueryData<ListCache>(LIST_KEY, {
          items: fullList,
          total: apiTotal,
        });
      }

      if (cancelled) return;

      // ── Phase 2: Pokémon details ───────────────────────────────────────────
      setPhase('details');
      const cachedPokemon: Record<number, Pokemon> = {};

      for (const item of fullList) {
        const hit = queryClient.getQueryData<Pokemon>(['pokemon', item.id]);
        // Verifica se o objeto na cache é da versão nova (com stats, height, etc)
        if (hit && hit.stats !== undefined && hit.height !== undefined) {
          cachedPokemon[item.id] = hit;
        } else if (hit) {
          // Objeto antigo na cache. Removemos para forçar um novo fetch.
          queryClient.removeQueries({ queryKey: ['pokemon', item.id] });
        }
      }

      const cachedCount = Object.keys(cachedPokemon).length;
      if (cachedCount > 0) {
        setPokemonMap({ ...cachedPokemon });
        setDetailsLoaded(cachedCount);
      }

      if (cancelled) return;

      // Fetch missing details
      const missing = fullList.filter((item) => !(item.id in cachedPokemon));

      for (const item of missing) {
        if (cancelled) break;
        try {
          const pokemon = await fetchPokemon(item.id);
          if (cancelled) break;
          // Store in query cache → persisted to IDB automatically.
          queryClient.setQueryData(['pokemon', item.id], pokemon);
          setPokemonMap((prev) => ({ ...prev, [item.id]: pokemon }));
          setDetailsLoaded((prev) => prev + 1);
        } catch {
          // skip individual failures — don't abort the whole queue
        }
      }

      if (!cancelled) setPhase('done');
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isRestoring, queryClient]);

  return { list, pokemonMap, phase, total, detailsLoaded };
}