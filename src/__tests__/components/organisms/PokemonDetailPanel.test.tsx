import { render, screen, fireEvent, act } from '@testing-library/react';
import { PokemonDetailPanel } from '@/components/organisms/PokemonDetailPanel';
import { usePokedex } from '@/context/PokedexContext';
import { sharePokemon } from '@/utils/share';
import { Pokemon } from '@/types/pokemon';

jest.mock('@/context/PokedexContext', () => ({
  usePokedex: jest.fn(),
}));

jest.mock('@/utils/share', () => ({
  sharePokemon: jest.fn(),
  formatName: (n: string) => n,
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('PokemonDetailPanel', () => {
  const mockPokemon: Pokemon = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    base_experience: 64,
    types: [{ slot: 1, type: { name: 'grass', url: '' } }],
    stats: [{ base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } }],
    sprites: { front_default: '', other: { 'official-artwork': { front_default: '' } } },
    abilities: [],
  };

  const mockContext = {
    isCaught: jest.fn(),
    catchPokemon: jest.fn(),
    releasePokemon: jest.fn(),
    updateNote: jest.fn(),
    entries: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePokedex as jest.Mock).mockReturnValue(mockContext);
  });

  it('renders pokemon information', () => {
    mockContext.isCaught.mockReturnValue(false);
    render(<PokemonDetailPanel pokemon={mockPokemon} />);

    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('#001')).toBeInTheDocument();
    expect(screen.getByText('0.7 m')).toBeInTheDocument();
    expect(screen.getByText('6.9 kg')).toBeInTheDocument();
  });

  it('calls catchPokemon when not caught and button clicked', () => {
    mockContext.isCaught.mockReturnValue(false);
    render(<PokemonDetailPanel pokemon={mockPokemon} />);

    fireEvent.click(screen.getByText('⊕ Catch!'));
    expect(mockContext.catchPokemon).toHaveBeenCalledWith(mockPokemon);
  });

  it('calls releasePokemon when caught and button clicked', () => {
    mockContext.isCaught.mockReturnValue(true);
    render(<PokemonDetailPanel pokemon={mockPokemon} />);

    fireEvent.click(screen.getByText('✕ Release'));
    expect(mockContext.releasePokemon).toHaveBeenCalledWith(mockPokemon.id);
  });

  it('allows editing and saving a note when caught', async () => {
    mockContext.isCaught.mockReturnValue(true);
    mockContext.entries = { [mockPokemon.id]: { id: 1, note: '', caughtAt: new Date().toISOString() } };
    
    render(<PokemonDetailPanel pokemon={mockPokemon} />);

    const textarea = screen.getByPlaceholderText(/Add a personal note/);
    fireEvent.change(textarea, { target: { value: 'My new note' } });
    
    fireEvent.click(screen.getByText('Save Note'));
    expect(mockContext.updateNote).toHaveBeenCalledWith(mockPokemon.id, 'My new note');
    
    expect(screen.getByText('✓ Saved')).toBeInTheDocument();
  });

  it('calls sharePokemon when share button clicked', () => {
    render(<PokemonDetailPanel pokemon={mockPokemon} />);
    fireEvent.click(screen.getByText('Share'));
    expect(sharePokemon).toHaveBeenCalledWith(mockPokemon);
  });
});
