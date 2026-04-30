'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FiltersContextType {
  search: string;
  setSearch: (q: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  caughtOnly: boolean;
  setCaughtOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [caughtOnly, setCaughtOnly] = useState(false);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('');
    setCaughtOnly(false);
  }, []);

  return (
    <FiltersContext.Provider
      value={{
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        caughtOnly,
        setCaughtOnly,
        clearFilters,
        hasActiveFilters: !!(search || typeFilter || caughtOnly),
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}