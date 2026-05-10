import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonGrid } from '@/components/organisms/PokemonGrid';
import { Pokemon } from '@/types/pokemon';

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

// Mock PokemonCard to focus on grid logic
jest.mock('@/components/organisms/PokemonCard', () => ({
  PokemonCard: ({ name, onOpenDetail, id }: any) => (
    <div data-testid={`pokemon-card-${id}`} onClick={() => onOpenDetail(id)}>
      {name}
    </div>
  ),
}));

describe('PokemonGrid', () => {
  const mockList = [
    { id: 1, name: 'bulbasaur' },
    { id: 2, name: 'ivysaur' },
    { id: 3, name: 'venusaur' },
  ];

  const mockPokemonMap: Record<number, Pokemon> = {
    1: { id: 1, name: 'bulbasaur', types: [], stats: [], height: 7, weight: 69 } as any,
  };

  const onOpenDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pokemon cards for the virtualized row', () => {
    render(
      <PokemonGrid 
        list={mockList} 
        pokemonMap={mockPokemonMap} 
        onOpenDetail={onOpenDetail} 
      />
    );

    // With 3 columns, the first virtual row (index 0) should show 3 cards
    expect(screen.getByTestId('pokemon-card-1')).toHaveTextContent('bulbasaur');
    expect(screen.getByTestId('pokemon-card-2')).toHaveTextContent('ivysaur');
    expect(screen.getByTestId('pokemon-card-3')).toHaveTextContent('venusaur');
  });

  it('calls onOpenDetail when a card is clicked', () => {
    render(
      <PokemonGrid 
        list={mockList} 
        pokemonMap={mockPokemonMap} 
        onOpenDetail={onOpenDetail} 
      />
    );

    fireEvent.click(screen.getByTestId('pokemon-card-1'));
    expect(onOpenDetail).toHaveBeenCalledWith(1);
  });

  it('calculates total height based on rows', () => {
    const { container } = render(
      <PokemonGrid 
        list={mockList} 
        pokemonMap={mockPokemonMap} 
        onOpenDetail={onOpenDetail} 
      />
    );
    
    // Total size from virtualizer mock is 320
    const innerDiv = screen.getByTestId('virtual-container');
    expect(innerDiv).toHaveStyle({ height: '320px' });
  });
});
