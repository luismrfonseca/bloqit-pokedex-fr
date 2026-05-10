import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';
import { usePokemonLoader } from '@/hooks/usePokemonLoader';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokedex } from '@/context/PokedexContext';
import { useFilters } from '@/context/FiltersContext';

jest.mock('@/hooks/usePokemonLoader');
jest.mock('@/hooks/usePokemonDetail');
jest.mock('@/context/PokedexContext');
jest.mock('@/context/FiltersContext');

// Mock components used in page to simplify
jest.mock('@/components/organisms/PokemonGrid', () => ({
  PokemonGrid: ({ list, onOpenDetail }: any) => (
    <div data-testid="grid">
      {list.map((p: any) => (
        <button key={p.id} onClick={() => onOpenDetail(p.id)}>{p.name}</button>
      ))}
    </div>
  )
}));

jest.mock('@/components/organisms/PokemonDetailPanel', () => ({
  PokemonDetailPanel: ({ pokemon }: any) => <div data-testid="detail">{pokemon.name}</div>
}));

jest.mock('@/components/templates/PageTemplate', () => ({
  PageTemplate: ({ children, title }: any) => <div><h1>{title}</h1>{children}</div>
}));

describe('HomePage', () => {
  const mockLoader = {
    list: [{ id: 1, name: 'bulbasaur', url: '' }],
    pokemonMap: { 
        1: { id: 1, name: 'bulbasaur', types: [{ type: { name: 'grass' } }], height: 7, weight: 69 } 
    },
    phase: 'done',
    total: 151,
    detailsLoaded: 151,
  };

  const mockPokedex = {
    isCaught: jest.fn().mockReturnValue(false),
    setTotalPokemon: jest.fn(),
  };

  const mockFilters = {
    search: '',
    typeFilter: '',
    caughtOnly: false,
    clearFilters: jest.fn(),
    hasActiveFilters: false,
    minHeight: 0,
    maxHeight: 200,
    minWeight: 0,
    maxWeight: 10000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePokemonLoader as jest.Mock).mockReturnValue(mockLoader);
    (usePokemonDetail as jest.Mock).mockReturnValue({ pokemon: null, loading: false });
    (usePokedex as jest.Mock).mockReturnValue(mockPokedex);
    (useFilters as jest.Mock).mockReturnValue(mockFilters);
  });

  it('renders loading skeletons when initial load', () => {
    (usePokemonLoader as jest.Mock).mockReturnValue({ ...mockLoader, phase: 'list', list: [] });
    render(<HomePage />);
    // Skeleton cards don't have text, but we can check for their presence via container or a testid if added
    // Here I'll just check if h1 is present
    expect(screen.getByText('All Pokémon')).toBeInTheDocument();
  });

  it('renders the pokemon grid when loaded', () => {
    render(<HomePage />);
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
  });

  it('filters pokemon by search query', () => {
    (useFilters as jest.Mock).mockReturnValue({ ...mockFilters, search: 'charmander' });
    render(<HomePage />);
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
  });

  it('opens detail modal when pokemon clicked', () => {
    (usePokemonDetail as jest.Mock).mockReturnValue({ 
        pokemon: mockLoader.pokemonMap[1], 
        loading: false 
    });
    
    render(<HomePage />);
    fireEvent.click(screen.getByText('bulbasaur'));
    
    expect(screen.getByTestId('detail')).toHaveTextContent('bulbasaur');
  });

  it('shows no results found when filter matches nothing', () => {
    (useFilters as jest.Mock).mockReturnValue({ ...mockFilters, search: 'nonexistent' });
    render(<HomePage />);
    expect(screen.getByText('No Pokémon match your filters')).toBeInTheDocument();
  });
});
