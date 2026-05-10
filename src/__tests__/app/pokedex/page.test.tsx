import { render, screen, fireEvent } from '@testing-library/react';
import PokedexPage from '@/app/pokedex/page';
import { usePokedex } from '@/context/PokedexContext';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { exportToCsv } from '@/utils/csv';

jest.mock('@/context/PokedexContext');
jest.mock('@/hooks/usePokemonDetail');
jest.mock('@/utils/csv', () => ({
  exportToCsv: jest.fn(),
  parseCsvString: jest.fn(),
}));

// Mock child components to focus on page logic
jest.mock('@/components/organisms/PokedexGrid', () => ({
  PokedexGrid: ({ entries, onOpenDetail, onToggleSelect, selectMode }: any) => (
    <div data-testid="pokedex-grid">
      {entries.map((e: any) => (
        <button key={e.id} onClick={() => selectMode ? onToggleSelect(e.id) : onOpenDetail(e.id)}>{e.name}</button>
      ))}
    </div>
  )
}));

jest.mock('@/components/organisms/PokedexTable', () => ({
  PokedexTable: ({ entries }: any) => <div data-testid="pokedex-table">{entries.length} rows</div>
}));

jest.mock('@/components/molecules/ProgressOverview', () => ({
  ProgressOverview: () => <div>Progress</div>
}));

jest.mock('@/components/templates/PageTemplate', () => ({
  PageTemplate: ({ children, title, topContent }: any) => <div><h1>{title}</h1>{topContent}{children}</div>
}));

describe('PokedexPage', () => {
  const mockEntries = {
    1: { id: 1, name: 'bulbasaur', note: '', caughtAt: '2024-01-01T00:00:00Z', types: [] },
  };

  const mockPokedex = {
    entries: mockEntries,
    totalCaught: 1,
    releaseMultiple: jest.fn(),
    importFromCsv: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePokedex as jest.Mock).mockReturnValue(mockPokedex);
    (usePokemonDetail as jest.Mock).mockReturnValue({ pokemon: null, loading: false });
    // Mock confirm for release
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it('renders empty state when no caught pokemon', () => {
    (usePokedex as jest.Mock).mockReturnValue({ ...mockPokedex, totalCaught: 0, entries: {} });
    render(<PokedexPage />);
    expect(screen.getByText('Your Pokédex is empty')).toBeInTheDocument();
  });

  it('renders entries when available', () => {
    render(<PokedexPage />);
    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
  });

  it('toggles between grid and table view', () => {
    render(<PokedexPage />);
    
    // Default is grid
    expect(screen.getByTestId('pokedex-grid')).toBeInTheDocument();
    
    // Switch to table
    const tableToggle = screen.getByTitle('Table view');
    fireEvent.click(tableToggle);
    
    expect(screen.getByTestId('pokedex-table')).toBeInTheDocument();
  });

  it('enters select mode and releases pokemon', () => {
    render(<PokedexPage />);
    
    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);
    
    // Click on pokemon to select it
    fireEvent.click(screen.getByText(/bulbasaur/i));
    
    const releaseButton = screen.getByText(/Release 1 Pokémon/);
    fireEvent.click(releaseButton);
    
    expect(mockPokedex.releaseMultiple).toHaveBeenCalledWith([1]);
  });

  it('triggers export csv', () => {
    render(<PokedexPage />);
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);
    expect(exportToCsv).toHaveBeenCalled();
  });
});
