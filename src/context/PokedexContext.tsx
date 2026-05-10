'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PokedexEntry, Pokemon } from '@/types/pokemon';

interface PokedexContextType {
  entries: Record<number, PokedexEntry>;
  catchPokemon: (pokemon: Pokemon) => void;
  releasePokemon: (id: number) => void;
  releaseMultiple: (ids: number[]) => void;
  updateNote: (id: number, note: string) => void;
  importFromCsv: (data: Partial<PokedexEntry>[]) => void;
  isCaught: (id: number) => boolean;
  totalCaught: number;
  totalPokemon: number;
  setTotalPokemon: (n: number) => void;
  ready: boolean;
}

const PokedexContext = createContext<PokedexContextType | undefined>(undefined);
const STORAGE_KEY = 'pokedex_entries';

export function PokedexProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [totalPokemon, setTotalPokemon] = useState(0);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: entries = {}, isSuccess } = useQuery({
    queryKey: [STORAGE_KEY],
    queryFn: () => {
      if (typeof window === 'undefined') return {};
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Record<number, PokedexEntry>) : {};
    },
    staleTime: Infinity,
  });

  const { mutate: saveToStorage } = useMutation({
    mutationFn: async (newEntries: Record<number, PokedexEntry>) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      return newEntries;
    },
    onSuccess: (newEntries) => {
      queryClient.setQueryData([STORAGE_KEY], newEntries);
    },
  });

  const catchPokemon = useCallback((pokemon: Pokemon) => {
    const newEntries = {
      ...entries,
      [pokemon.id]: {
        ...pokemon,
        caughtAt: new Date().toISOString(),
        note: entries[pokemon.id]?.note ?? '',
      },
    };
    saveToStorage(newEntries);
  }, [entries, saveToStorage]);

  const releasePokemon = useCallback((id: number) => {
    const newEntries = { ...entries };
    delete newEntries[id];
    saveToStorage(newEntries);
  }, [entries, saveToStorage]);

  const releaseMultiple = useCallback((ids: number[]) => {
    const newEntries = { ...entries };
    ids.forEach((id) => delete newEntries[id]);
    saveToStorage(newEntries);
  }, [entries, saveToStorage]);

  const updateNote = useCallback((id: number, note: string) => {
    const newEntries = {
      ...entries,
      [id]: { ...entries[id], note },
    };
    saveToStorage(newEntries);
  }, [entries, saveToStorage]);

  const importFromCsv = useCallback((data: Partial<PokedexEntry>[]) => {
    const newEntries = { ...entries };
    data.forEach((item) => {
      if (item.id) {
        newEntries[item.id] = {
          ...(newEntries[item.id] || {}),
          ...item,
        } as PokedexEntry;
      }
    });
    saveToStorage(newEntries);
  }, [entries, saveToStorage]);

  const isCaught = useCallback((id: number) => id in entries, [entries]);

  const contextValue = useMemo(() => ({
    entries: mounted ? entries : {},
    catchPokemon,
    releasePokemon,
    releaseMultiple,
    updateNote,
    importFromCsv,
    isCaught,
    totalCaught: mounted ? Object.keys(entries).length : 0,
    totalPokemon,
    setTotalPokemon,
    ready: mounted && isSuccess,
  }), [mounted, entries, catchPokemon, releasePokemon, releaseMultiple, updateNote, importFromCsv, isCaught, totalPokemon, isSuccess]);

  return (
    <PokedexContext.Provider value={contextValue}>
      {children}
    </PokedexContext.Provider>
  );
}

export function usePokedex() {
  const ctx = useContext(PokedexContext);
  if (!ctx) throw new Error('usePokedex should be used within PokedexProvider');
  return ctx;
}