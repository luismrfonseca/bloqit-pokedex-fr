'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPokemon } from '@/services/pokemonService';
import { Pokemon } from '@/types/pokemon';

export function usePokemonDetail(id: number | null) {
  const { data, isLoading } = useQuery<Pokemon>({
    queryKey: ['pokemon', id ?? 0],
    queryFn: () => fetchPokemon(id!),
    enabled: id !== null,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  return { pokemon: data ?? null, loading: id !== null && isLoading };
}