import { renderHook, waitFor } from '@testing-library/react';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchPokemon } from '@/services/pokemonService';
import { ReactNode } from 'react';

jest.mock('@/services/pokemonService', () => ({
  fetchPokemon: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePokemonDetail', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('returns null and not loading when id is null', () => {
    const { result } = renderHook(() => usePokemonDetail(null), { wrapper });
    expect(result.current.pokemon).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('fetches pokemon when id is provided', async () => {
    const mockPokemon = { id: 25, name: 'pikachu' };
    (fetchPokemon as jest.Mock).mockResolvedValue(mockPokemon);

    const { result } = renderHook(() => usePokemonDetail(25), { wrapper });

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.pokemon).toEqual(mockPokemon);
    });
    expect(result.current.loading).toBe(false);
  });
});
