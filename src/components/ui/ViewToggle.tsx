'use client';

import { ViewMode } from '@/types/pokemon';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
          view === 'grid'
            ? 'bg-red-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="Grid view"
      >
        <GridIcon />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onChange('table')}
        className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
          view === 'table'
            ? 'bg-red-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="Table view"
      >
        <TableIcon />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 10h18M3 14h18M10 4v16M14 4v16M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  );
}