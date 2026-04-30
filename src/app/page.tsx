'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { PokemonDetailPanel } from '@/components/pokemon/PokemonDetailPanel';
import { Modal } from '@/components/ui/Modal';
import { usePokemonLoader } from '@/hooks/usePokemonLoader';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokedex } from '@/context/PokedexContext';
import { useFilters } from '@/context/FiltersContext';

export default function HomePage() {
  const { list, pokemonMap, phase, total, detailsLoaded } = usePokemonLoader();
  const { isCaught, setTotalPokemon } = usePokedex();
  const { search, typeFilter, caughtOnly, clearFilters, hasActiveFilters } = useFilters();

  useEffect(() => {
    if (total > 0) setTotalPokemon(total);
  }, [total, setTotalPokemon]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { pokemon: detailPokemon, loading: detailLoading } = usePokemonDetail(selectedId);

  const initialLoad = phase === 'list' && list.length === 0;

  const filtered = useMemo(() => {
    let result = list;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.includes(q) || String(p.id).padStart(3, '0').includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter((p) =>
        pokemonMap[p.id]?.types.some((t) => t.type.name === typeFilter)
      );
    }

    if (caughtOnly) {
      result = result.filter((p) => isCaught(p.id));
    }

    return result;
  }, [list, search, typeFilter, caughtOnly, pokemonMap, isCaught]);

  const handleOpenDetail = useCallback((id: number) => setSelectedId(id), []);
  const handleCloseDetail = useCallback(() => setSelectedId(null), []);

  const counterLabel = (() => {
    if (initialLoad) return 'Loading…';
    if (phase === 'list') return `${list.length}${total ? ` / ${total}` : ''} Pokémon`;
    return `${filtered.length}${total && !hasActiveFilters ? ` / ${total}` : ''} Pokémon`;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">All Pokémon</h1>
          <p className="text-gray-500 text-sm">Browse all Pokémon and build your Pokédex.</p>
        </div>
        <span className="text-sm text-gray-400 whitespace-nowrap ml-4">{counterLabel}</span>
      </div>

      {/* Grid */}
      {initialLoad ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium">No Pokémon match your filters</p>
          <button onClick={clearFilters} className="mt-3 text-sm text-red-500 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((p) => (
            <PokemonCard
              key={p.id}
              id={p.id}
              name={p.name}
              pokemon={pokemonMap[p.id] ?? null}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* Loading banners */}
      {phase === 'list' && list.length > 0 && (
        <LoadingBanner
          message="Building Pokémon list…"
          detail={total ? `${list.length} / ${total}` : `${list.length} loaded`}
        />
      )}
      {phase === 'details' && (
        <LoadingBanner
          message="Loading Pokémon details…"
          detail={total ? `${detailsLoaded} / ${total}` : `${detailsLoaded} loaded`}
        />
      )}

      <Modal open={selectedId !== null} onClose={handleCloseDetail}>
        {detailLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!detailLoading && detailPokemon && (
          <PokemonDetailPanel pokemon={detailPokemon} />
        )}
      </Modal>
    </div>
  );
}

function LoadingBanner({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3 py-4 text-gray-500">
      <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <span className="text-xs text-gray-400 tabular-nums">({detail})</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse">
      <div className="aspect-square w-full bg-gray-100 rounded-xl mb-3" />
      <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="flex gap-1 mb-3">
        <div className="h-5 w-14 bg-gray-100 rounded" />
      </div>
      <div className="h-7 w-full bg-gray-100 rounded-lg" />
    </div>
  );
}