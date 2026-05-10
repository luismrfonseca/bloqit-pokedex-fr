import { renderHook, waitFor } from '@testing-library/react';
import { usePokemonLoader } from '@/hooks/usePokemonLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchCompleteListRecursive, fetchPokemon } from '@/services/pokemonService';
import { ReactNode } from 'react';

jest.mock('@/services/pokemonService', () => ({
  fetchCompleteListRecursive: jest.fn(),
  fetchPokemon: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePokemonLoader', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('starts in list phase and fetches the list', async () => {
    (fetchCompleteListRecursive as jest.Mock).mockImplementation((cb) => {
      cb([{ id: 1, name: 'bulbasaur', url: '' }], 1);
      return Promise.resolve();
    });
    (fetchPokemon as jest.Mock).mockResolvedValue({ id: 1, name: 'bulbasaur', stats: [], types: [] });

    const { result } = renderHook(() => usePokemonLoader(), { wrapper });

    expect(result.current.phase).toBe('list');
    
    await waitFor(() => {
      expect(result.current.total).toBe(1);
    });

    await waitFor(() => {
      expect(result.current.phase).toBe('done');
    });

    expect(result.current.list).toHaveLength(1);
    expect(result.current.pokemonMap[1]).toBeDefined();
  });

  it('skips list fetching if cache exists', async () => {
    queryClient.setQueryData(['pokemon-list'], {
      items: [{ id: 1, name: 'bulbasaur', url: '' }],
      total: 1,
    });
    (fetchPokemon as jest.Mock).mockResolvedValue({ id: 1, name: 'bulbasaur', stats: [], types: [] });

    const { result } = renderHook(() => usePokemonLoader(), { wrapper });

    await waitFor(() => {
      expect(result.current.phase).toBe('done');
    });

    expect(fetchCompleteListRecursive).not.toHaveBeenCalled();
    expect(result.current.list).toHaveLength(1);
  });

  it('handles fetch errors gracefully', async () => {
    (fetchCompleteListRecursive as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => usePokemonLoader(), { wrapper });

    await waitFor(() => {
      // It should still move to details phase (even if empty) and then done
      expect(result.current.phase).toBe('done');
    });
    
    expect(result.current.list).toHaveLength(0);
  });
});
