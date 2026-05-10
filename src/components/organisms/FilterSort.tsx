'use client';

import { useState } from 'react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof FilterSortState>(key: K, value: FilterSortState[K]) =>
    onChange({ ...state, [key]: value });

  const toggleOrder = () =>
    set('sortOrder', state.sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <div className="flex flex-col gap-3">
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

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
            showAdvanced
              ? 'bg-gray-100 text-gray-900 border-gray-400'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Filters
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Height Range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <span>Height Range</span>
              <span className="text-gray-800">{(state.minHeight / 10).toFixed(1)}m – {(state.maxHeight / 10).toFixed(1)}m</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={state.minHeight}
                onChange={(e) => set('minHeight', Number(e.target.value))}
                className="flex-1 accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={state.maxHeight}
                onChange={(e) => set('maxHeight', Number(e.target.value))}
                className="flex-1 accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Weight Range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <span>Weight Range</span>
              <span className="text-gray-800">{(state.minWeight / 10).toFixed(1)}kg – {(state.maxWeight / 10).toFixed(1)}kg</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10000"
                step="10"
                value={state.minWeight}
                onChange={(e) => set('minWeight', Number(e.target.value))}
                className="flex-1 accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="10"
                value={state.maxWeight}
                onChange={(e) => set('maxWeight', Number(e.target.value))}
                className="flex-1 accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}