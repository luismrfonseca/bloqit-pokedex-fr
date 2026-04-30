'use client';

import { useState } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { createQueryClient } from '@/lib/queryClient';

const idbStorage = {
  getItem: async (key: string): Promise<string | null> =>
    (await get<string>(key)) ?? null,
  setItem: (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: idbStorage,
      key: 'POKEDEX_IDB_CACHE',
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        buster: 'v1',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}