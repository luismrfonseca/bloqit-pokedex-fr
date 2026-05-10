'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { PokemonCard } from '@/components/organisms/PokemonCard';
import { PokemonDetailPanel } from '@/components/organisms/PokemonDetailPanel';
import { Modal } from '@/components/organisms/Modal';
import { usePokemonLoader } from '@/hooks/usePokemonLoader';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokedex } from '@/context/PokedexContext';
import { useFilters } from '@/context/FiltersContext';
import { PageTemplate } from '@/components/templates/PageTemplate';
import { PokemonGrid } from '@/components/organisms/PokemonGrid';

export default function HomePage() {
  const { list, pokemonMap, phase, total, detailsLoaded } = usePokemonLoader();
  const { isCaught, setTotalPokemon } = usePokedex();
  const { 
    search, typeFilter, caughtOnly, clearFilters, hasActiveFilters,
    minHeight, maxHeight, minWeight, maxWeight
  } = useFilters();

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

    if (typeFilter || minHeight > 0 || maxHeight < 200 || minWeight > 0 || maxWeight < 10000) {
      result = result.filter((p) => {
        const data = pokemonMap[p.id];
        if (!data) return !typeFilter; // If no data, only keep if no type filter is active

        if (typeFilter && !data.types.some((t) => t.type.name === typeFilter)) return false;
        if (data.height < minHeight || data.height > maxHeight) return false;
        if (data.weight < minWeight || data.weight > maxWeight) return false;
        return true;
      });
    }

    if (caughtOnly) {
      result = result.filter((p) => isCaught(p.id));
    }

    return result;
  }, [list, search, typeFilter, caughtOnly, pokemonMap, isCaught, minHeight, maxHeight, minWeight, maxWeight]);

  const handleOpenDetail = useCallback((id: number) => setSelectedId(id), []);
  const handleCloseDetail = useCallback(() => setSelectedId(null), []);

  const counterLabel = (() => {
    if (initialLoad) return 'Loading…';
    if (phase === 'list') return `${list.length}${total ? ` / ${total}` : ''} Pokémon`;
    return `${filtered.length}${total && !hasActiveFilters ? ` / ${total}` : ''} Pokémon`;
  })();

  return (
    <PageTemplate
      title="All Pokémon"
      subtitle="Browse all Pokémon and build your Pokédex."
      headerAction={<span className="text-sm text-gray-400">{counterLabel}</span>}
    >
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
        <PokemonGrid
          list={filtered}
          pokemonMap={pokemonMap}
          onOpenDetail={handleOpenDetail}
        />
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
    </PageTemplate>
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