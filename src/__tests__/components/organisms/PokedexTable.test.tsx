import { render, screen, fireEvent } from '@testing-library/react';
import { PokedexTable } from '@/components/organisms/PokedexTable';
import { PokedexEntry, Pokemon } from '@/types/pokemon';

// Mock tanstack virtual
jest.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: jest.fn().mockReturnValue({
    getVirtualItems: () => [{ index: 0, key: 0, size: 64, start: 0 }],
    getTotalSize: () => 64,
    measureElement: jest.fn(),
    options: { scrollMargin: 0 },
  }),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('PokedexTable', () => {
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
    onSelectAll: jest.fn(),
    onOpenDetail: jest.fn(),
  };

  it('renders empty state when no entries', () => {
    render(
      <PokedexTable 
        entries={[]} 
        pokemonData={{}} 
        selected={new Set()} 
        selectMode={false} 
        {...mockHandlers} 
      />
    );
    expect(screen.getByText('No Pokémon found')).toBeInTheDocument();
  });

  it('renders table rows with pokemon data', () => {
    render(
      <PokedexTable 
        entries={mockEntries} 
        pokemonData={mockPokemonData} 
        selected={new Set()} 
        selectMode={false} 
        {...mockHandlers} 
      />
    );
    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText('my note')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument(); // HP stat
  });

  it('calls onOpenDetail when row clicked in normal mode', () => {
    render(
      <PokedexTable 
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

  it('calls onToggleSelect when row clicked in select mode', () => {
    render(
      <PokedexTable 
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

  it('calls onSelectAll when header checkbox clicked', () => {
    render(
      <PokedexTable 
        entries={mockEntries} 
        pokemonData={mockPokemonData} 
        selected={new Set()} 
        selectMode={true} 
        {...mockHandlers} 
      />
    );
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(mockHandlers.onSelectAll).toHaveBeenCalled();
  });
});
