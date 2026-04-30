'use client';

import { FilterSortState, SortField } from '@/types/pokemon';
import { TYPE_COLORS } from '@/types/pokemon';

interface FilterSortProps {
  state: FilterSortState;
  onChange: (state: FilterSortState) => void;
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'height', label: 'Height' },
  { value: 'types', label: 'Type' },
  { value: 'caughtAt', label: 'Date Caught' },
];

const ALL_TYPES = Object.keys(TYPE_COLORS);

export function FilterSort({ state, onChange }: FilterSortProps) {
  const set = <K extends keyof FilterSortState>(key: K, value: FilterSortState[K]) =>
    onChange({ ...state, [key]: value });

  const toggleOrder = () =>
    set('sortOrder', state.sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={state.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />
      </div>

      <select
        value={state.typeFilter}
        onChange={(e) => set('typeFilter', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
      >
        <option value="">All Types</option>
        {ALL_TYPES.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
        <select
          value={state.sortField}
          onChange={(e) => set('sortField', e.target.value as SortField)}
          className="px-3 py-2 text-sm bg-white focus:outline-none border-r border-gray-300"
        >
          {SORT_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleOrder}
          className="px-2 py-2 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          title={state.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {state.sortOrder === 'asc' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m10 4V4m0 0l-3 3m3-3l3 3" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m10 0V4m0 16l-3-3m3 3l3-3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}