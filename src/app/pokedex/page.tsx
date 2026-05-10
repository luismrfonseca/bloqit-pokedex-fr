'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePokedex } from '@/context/PokedexContext';
import { ProgressOverview } from '@/components/molecules/ProgressOverview';
import { FilterSort } from '@/components/organisms/FilterSort';
import { PokedexGrid } from '@/components/organisms/PokedexGrid';
import { PokedexTable } from '@/components/organisms/PokedexTable';
import { ViewToggle } from '@/components/molecules/ViewToggle';
import { Modal } from '@/components/organisms/Modal';
import { PokemonDetailPanel } from '@/components/organisms/PokemonDetailPanel';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { exportToCsv, parseCsvString } from '@/utils/csv';
import { FilterSortState, ViewMode, Pokemon } from '@/types/pokemon';
import Link from 'next/link';
import { PageTemplate } from '@/components/templates/PageTemplate';

const DEFAULT_FILTERS: FilterSortState = {
  search: '',
  typeFilter: '',
  sortField: 'caughtAt',
  sortOrder: 'desc',
  minHeight: 0,
  maxHeight: 200,
  minWeight: 0,
  maxWeight: 10000,
};

export default function PokedexPage() {
  const { entries, totalCaught, releaseMultiple, importFromCsv } = usePokedex();
  const allEntries = useMemo(() => Object.values(entries), [entries]);

  const [filters, setFilters] = useState<FilterSortState>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>('grid');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { pokemon: detailPokemon, loading: detailLoading } = usePokemonDetail(selectedId);

  const filteredEntries = useMemo(() => {
    let result = allEntries;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) => e.name.includes(q) || String(e.id).padStart(3, '0').includes(q)
      );
    }

    if (filters.typeFilter || filters.minHeight > 0 || filters.maxHeight < 200 || filters.minWeight > 0 || filters.maxWeight < 10000) {
      result = result.filter((e) => {
        const p = entries[e.id] as Pokemon | undefined;
        if (!p) return !filters.typeFilter;

        if (filters.typeFilter && !p.types?.some((t) => t.type.name === filters.typeFilter)) return false;
        if (p.height < filters.minHeight || p.height > filters.maxHeight) return false;
        if (p.weight < filters.minWeight || p.weight > filters.maxWeight) return false;
        return true;
      });
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      const pa = entries[a.id] as Pokemon | undefined;
      const pb = entries[b.id] as Pokemon | undefined;

      switch (filters.sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'height':
          cmp = (pa?.height ?? 0) - (pb?.height ?? 0);
          break;
        case 'types':
          cmp = (pa?.types[0]?.type.name ?? '').localeCompare(pb?.types[0]?.type.name ?? '');
          break;
        case 'caughtAt':
          cmp = new Date(a.caughtAt).getTime() - new Date(b.caughtAt).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allEntries, filters, entries]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === filteredEntries.length
        ? new Set()
        : new Set(filteredEntries.map((e) => e.id))
    );
  }, [filteredEntries]);

  const handleDeleteSelected = useCallback(() => {
    if (selected.size === 0) return;
    if (!confirm(`Release ${selected.size} Pokémon from your Pokédex?`)) return;
    releaseMultiple(Array.from(selected));
    setSelected(new Set());
    setSelectMode(false);
  }, [selected, releaseMultiple]);

  const handleExportCsv = useCallback(() => {
    exportToCsv(filteredEntries, entries);
  }, [filteredEntries, entries]);

  const handleImportCsv = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const data = parseCsvString(csv);
      if (data.length > 0) {
        importFromCsv(data);
        alert(`Successfully imported ${data.length} entries!`);
      } else {
        alert('Could not parse CSV or file is empty.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  }, [importFromCsv]);

  const handleOpenDetail = useCallback((id: number) => setSelectedId(id), []);
  const handleCloseDetail = useCallback(() => setSelectedId(null), []);

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelected(new Set());
  };

  if (totalCaught === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressOverview />
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-gray-400">
          <div className="text-7xl">📭</div>
          <h2 className="text-xl font-bold text-gray-700">Your Pokédex is empty</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-center max-w-sm">
              Head over to{' '}
              <Link href="/" className="text-red-500 font-medium hover:underline">
                All Pokémon
              </Link>{' '}
              and start catching!
            </p>
            <div className="mt-4 border-t border-gray-100 pt-6 w-full flex flex-col items-center">
              <p className="text-xs mb-3">Or restore from a backup:</p>
              <label className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
                <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="My Pokédex"
      subtitle="Manage your caught Pokémon collection."
      topContent={
        <>
          <ProgressOverview />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
            <FilterSort state={filters} onChange={setFilters} />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <ViewToggle view={view} onChange={setView} />

              <button
                onClick={toggleSelectMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectMode
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {selectMode ? 'Cancel Selection' : 'Select'}
              </button>

              {selectMode && selected.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Release {selected.size} Pokémon
                </button>
              )}

              <div className="ml-auto flex items-center gap-2">
                <label className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import CSV
                  <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
                </label>

                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {filteredEntries.length > 0 && (
              <p className="text-xs text-gray-400">
                Showing {filteredEntries.length} of {totalCaught} Pokémon
              </p>
            )}
          </div>
        </>
      }
    >
      {view === 'grid' ? (
        <PokedexGrid
          entries={filteredEntries}
          pokemonData={entries}
          selected={selected}
          selectMode={selectMode}
          onToggleSelect={handleToggleSelect}
          onOpenDetail={handleOpenDetail}
        />
      ) : (
        <PokedexTable
          entries={filteredEntries}
          pokemonData={entries}
          selected={selected}
          selectMode={selectMode}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onOpenDetail={handleOpenDetail}
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