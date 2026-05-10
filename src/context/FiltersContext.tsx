'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FiltersContextType {
  search: string;
  setSearch: (q: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  caughtOnly: boolean;
  setCaughtOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  minHeight: number;
  setMinHeight: (v: number) => void;
  maxHeight: number;
  setMaxHeight: (v: number) => void;
  minWeight: number;
  setMinWeight: (v: number) => void;
  maxWeight: number;
  setMaxWeight: (v: number) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

// Pokemon max stats approx: height ~200dm (20m), weight ~10000hg (1000kg)
export const MAX_HEIGHT = 200;
export const MAX_WEIGHT = 10000;

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [caughtOnly, setCaughtOnly] = useState(false);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(MAX_HEIGHT);
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(MAX_WEIGHT);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('');
    setCaughtOnly(false);
    setMinHeight(0);
    setMaxHeight(MAX_HEIGHT);
    setMinWeight(0);
    setMaxWeight(MAX_WEIGHT);
  }, []);

  const hasActiveFilters = !!(
    search || 
    typeFilter || 
    caughtOnly || 
    minHeight > 0 || 
    maxHeight < MAX_HEIGHT || 
    minWeight > 0 || 
    maxWeight < MAX_WEIGHT
  );

  return (
    <FiltersContext.Provider
      value={{
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        caughtOnly,
        setCaughtOnly,
        minHeight,
        setMinHeight,
        maxHeight,
        setMaxHeight,
        minWeight,
        setMinWeight,
        maxWeight,
        setMaxWeight,
        clearFilters,
        hasActiveFilters,
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