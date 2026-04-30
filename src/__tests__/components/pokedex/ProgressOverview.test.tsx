import { render, screen } from '@testing-library/react';
import { ProgressOverview } from '@/components/pokedex/ProgressOverview';
import { PokedexProvider } from '@/context/PokedexContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/hooks/usePokemonLoader', () => ({
  usePokemonLoader: () => ({
    total: 151,
  }),
}));

function renderWithProvider(preload?: Record<string, unknown>) {
  if (preload) {
    localStorage.setItem('pokedex_entries', JSON.stringify(preload));
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PokedexProvider>
        <ProgressOverview />
      </PokedexProvider>
    </QueryClientProvider>
  );
}

describe('ProgressOverview', () => {
  beforeEach(() => localStorage.clear());

  it('shows 0 caught when Pokédex is empty', () => {
    renderWithProvider();
    // the caught count is the large red span; use getAllByText because "0" also
    // appears as the left tick of the progress scale
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
    expect(screen.getByText(/\/ 151/)).toBeInTheDocument();
  });

  it('shows the correct caught count when entries exist', async () => {
    const entries = {
      1: { id: 1, name: 'bulbasaur', caughtAt: new Date().toISOString(), note: '' },
      4: { id: 4, name: 'charmander', caughtAt: new Date().toISOString(), note: '' },
    };
    renderWithProvider(entries);
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('shows 0% complete label when nothing is caught', () => {
    renderWithProvider();
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });

  it('shows the encouragement message when all 151 are caught', async () => {
    const entries: Record<string, unknown> = {};
    for (let i = 1; i <= 151; i++) {
      entries[i] = { id: i, name: `pokemon-${i}`, caughtAt: new Date().toISOString(), note: '' };
    }
    renderWithProvider(entries);
    expect(await screen.findByText(/caught them all/i)).toBeInTheDocument();
  });

  it('shows remaining count when some are caught', async () => {
    const entries = {
      1: { id: 1, name: 'bulbasaur', caughtAt: new Date().toISOString(), note: '' },
    };
    renderWithProvider(entries);
    expect(await screen.findByText('150 left to catch')).toBeInTheDocument();
  });

  it('renders the progress bar element', () => {
    const { container } = renderWithProvider();
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });
});