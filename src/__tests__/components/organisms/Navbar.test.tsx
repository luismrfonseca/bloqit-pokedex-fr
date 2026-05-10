import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/organisms/Navbar';
import { usePathname } from 'next/navigation';
import { usePokedex } from '@/context/PokedexContext';
import { useFilters } from '@/context/FiltersContext';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/context/PokedexContext', () => ({
  usePokedex: jest.fn(),
}));

jest.mock('@/context/FiltersContext', () => ({
  useFilters: jest.fn(),
}));

describe('Navbar', () => {
  const mockFilters = {
    search: '',
    setSearch: jest.fn(),
    typeFilter: '',
    setTypeFilter: jest.fn(),
    caughtOnly: false,
    setCaughtOnly: jest.fn(),
    minHeight: 0,
    setMinHeight: jest.fn(),
    maxHeight: 200,
    setMaxHeight: jest.fn(),
    minWeight: 0,
    setMinWeight: jest.fn(),
    maxWeight: 10000,
    setMaxWeight: jest.fn(),
    clearFilters: jest.fn(),
    hasActiveFilters: false,
  };

  const mockPokedex = {
    totalCaught: 10,
    totalPokemon: 151,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (usePokedex as jest.Mock).mockReturnValue(mockPokedex);
    (useFilters as jest.Mock).mockReturnValue(mockFilters);
  });

  it('renders the title and caught count', () => {
    render(<Navbar />);
    expect(screen.getByText('Pokédex Tracker')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('/151')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('All Pokémon')).toBeInTheDocument();
    expect(screen.getByText('My Pokédex')).toBeInTheDocument();
  });

  it('shows search and filters on the home page', () => {
    render(<Navbar />);
    expect(screen.getByPlaceholderText('Search by name or number…')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('hides search and filters on other pages', () => {
    (usePathname as jest.Mock).mockReturnValue('/pokedex');
    render(<Navbar />);
    expect(screen.queryByPlaceholderText('Search by name or number…')).not.toBeInTheDocument();
  });

  it('calls setSearch on input change', () => {
    render(<Navbar />);
    const input = screen.getByPlaceholderText('Search by name or number…');
    fireEvent.change(input, { target: { value: 'pikachu' } });
    expect(mockFilters.setSearch).toHaveBeenCalledWith('pikachu');
  });

  it('toggles advanced filters panel', () => {
    render(<Navbar />);
    const moreButton = screen.getByText('More');
    
    // Initially hidden
    expect(screen.queryByText('Height Range')).not.toBeInTheDocument();
    
    fireEvent.click(moreButton);
    expect(screen.getByText('Height Range')).toBeInTheDocument();
    expect(screen.getByText('Weight Range')).toBeInTheDocument();
  });

  it('calls clearFilters when clicking clear button', () => {
    (useFilters as jest.Mock).mockReturnValue({ ...mockFilters, hasActiveFilters: true });
    render(<Navbar />);
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    expect(mockFilters.clearFilters).toHaveBeenCalled();
  });
});
