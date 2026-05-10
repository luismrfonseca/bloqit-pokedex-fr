import { render, screen, fireEvent } from '@testing-library/react';
import { PokedexGrid } from '@/components/organisms/PokedexGrid';
import { PokedexEntry, Pokemon } from '@/types/pokemon';

// Mock hooks
jest.mock('@/hooks/useColumns', () => ({
  useColumns: jest.fn().mockReturnValue(3),
}));

// Mock tanstack virtual
jest.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: jest.fn().mockReturnValue({
    getVirtualItems: () => [{ index: 0, key: 0, size: 320, start: 0 }],
    getTotalSize: () => 320,
    measureElement: jest.fn(),
    options: { scrollMargin: 0 },
  }),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('PokedexGrid', () => {
  const mockEntries: PokedexEntry[] = [
    {
      id: 1, name: 'bulbasaur', note: 'my note', caughtAt: '2024-01-01T00:00:00Z',
      height: 0,
      weight: 0,
      types: [],
      stats: [],
      sprites: {
        front_default: '',
        other: { 'official-artwork': { front_default: '' } }
      },
      abilities: [],
      base_experience: 0
    },
  ];
  const mockPokemonData: Record<number, Pokemon> = {
    1: {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      base_experience: 64,
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
      stats: [{ base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } }],
      sprites: { front_default: '', other: { 'official-artwork': { front_default: '' } } },
      abilities: [],
    },
  };

  const mockHandlers = {
    onToggleSelect: jest.fn(),
    onOpenDetail: jest.fn(),
  };

  it('renders empty state when no entries', () => {
    render(
      <PokedexGrid 
        entries={[]} 
        pokemonData={{}} 
        selected={new Set()} 
        selectMode={false} 
        {...mockHandlers} 
      />
    );
    expect(screen.getByText('No Pokémon found')).toBeInTheDocument();
  });

  it('renders grid cards with pokemon data', () => {
    render(
      <PokedexGrid 
        entries={mockEntries} 
        pokemonData={mockPokemonData} 
        selected={new Set()} 
        selectMode={false} 
        {...mockHandlers} 
      />
    );
    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText('my note')).toBeInTheDocument();
  });

  it('calls onOpenDetail when card clicked in normal mode', () => {
    render(
      <PokedexGrid 
        entries={mockEntries} 
        pokemonData={mockPokemonData} 
        selected={new Set()} 
        selectMode={false} 
        {...mockHandlers} 
      />
    );
    fireEvent.click(screen.getByText(/bulbasaur/i));
    expect(mockHandlers.onOpenDetail).toHaveBeenCalledWith(1);
  });

  it('calls onToggleSelect when card clicked in select mode', () => {
    render(
      <PokedexGrid 
        entries={mockEntries} 
        pokemonData={mockPokemonData} 
        selected={new Set()} 
        selectMode={true} 
        {...mockHandlers} 
      />
    );
    fireEvent.click(screen.getByText(/bulbasaur/i));
    expect(mockHandlers.onToggleSelect).toHaveBeenCalledWith(1);
  });
});
