import { exportToCsv, buildCsvString, parseCsvString } from '@/utils/csv';
import { PokedexEntry, Pokemon } from '@/types/pokemon';

const mockEntry: PokedexEntry = {
    id: 1,
    name: 'bulbasaur',
    caughtAt: '2024-01-15T10:30:00.000Z',
    note: 'My first catch',
    height: 0,
    weight: 0,
    types: [],
    stats: [],
    sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
    abilities: [],
    base_experience: 0
};

const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  types: [
    { slot: 1, type: { name: 'grass', url: '' } },
    { slot: 2, type: { name: 'poison', url: '' } },
  ],
  stats: [
    { base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 49, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 49, effort: 0, stat: { name: 'defense', url: '' } },
    { base_stat: 65, effort: 1, stat: { name: 'special-attack', url: '' } },
    { base_stat: 65, effort: 0, stat: { name: 'special-defense', url: '' } },
    { base_stat: 45, effort: 0, stat: { name: 'speed', url: '' } },
  ],
  sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
  abilities: [],
};

// Pure function tests — no DOM required
describe('buildCsvString', () => {
  it('first row contains all expected column headers', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    const header = csv.split('\n')[0];
    expect(header).toContain('ID');
    expect(header).toContain('Name');
    expect(header).toContain('Types');
    expect(header).toContain('HP');
    expect(header).toContain('Caught At');
    expect(header).toContain('Note');
  });

  it('includes Pokémon types joined with +', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    expect(csv).toContain('grass+poison');
  });

  it('converts height from decimetres to metres', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    expect(csv).toContain('0.7');
  });

  it('converts weight from hectograms to kilograms', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    expect(csv).toContain('6.9');
  });

  it('includes the base HP stat', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    expect(csv).toContain(',45,');
  });

  it('escapes double quotes in notes', () => {
    const entry: PokedexEntry = { ...mockEntry, note: 'He said "hello"' };
    const csv = buildCsvString([entry], { 1: mockPokemon });
    expect(csv).toContain('He said ""hello""');
  });

  it('handles entries with missing Pokémon data gracefully', () => {
    expect(() => buildCsvString([mockEntry], {})).not.toThrow();
  });

  it('produces one header row plus one data row', () => {
    const csv = buildCsvString([mockEntry], { 1: mockPokemon });
    expect(csv.split('\n')).toHaveLength(2);
  });
});

// Side-effect tests — minimal DOM mocking
describe('exportToCsv', () => {
  let clickSpy: jest.Mock;

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:test');
    global.URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clickSpy = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
  });

  afterEach(() => jest.restoreAllMocks());

  it('creates a Blob with CSV content type', () => {
    exportToCsv([mockEntry], { 1: mockPokemon });
    const blobArg = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blobArg.type).toContain('text/csv');
  });

  it('triggers a download click', () => {
    exportToCsv([mockEntry], { 1: mockPokemon });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL after triggering download', () => {
    exportToCsv([mockEntry], { 1: mockPokemon });
    expect(global.URL.revokeObjectURL as jest.Mock).toHaveBeenCalledWith('blob:test');
  });
});

describe('parseCsvString', () => {
  it('successfully parses a valid CSV string', () => {
    const csv = 'ID,Name,Caught At,Note\n25,Pikachu,2024-01-15T10:30:00.000Z,"Great catch!"';
    const result = parseCsvString(csv);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(25);
    expect(result[0].name).toBe('Pikachu');
    expect(result[0].note).toBe('Great catch!');
  });

  it('handles quoted notes with commas', () => {
    const csv = 'ID,Name,Caught At,Note\n25,Pikachu,2024-01-15T10:30:00.000Z,"Note with , comma"';
    const result = parseCsvString(csv);
    expect(result[0].note).toBe('Note with , comma');
  });

  it('handles escaped double quotes in notes', () => {
    const csv = 'ID,Name,Caught At,Note\n25,Pikachu,2024-01-15T10:30:00.000Z,"He said ""hello"""';
    const result = parseCsvString(csv);
    expect(result[0].note).toBe('He said "hello"');
  });

  it('returns empty array for invalid headers', () => {
    const csv = 'Wrong,Header\n1,Value';
    const result = parseCsvString(csv);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty string', () => {
    expect(parseCsvString('')).toHaveLength(0);
  });

  it('skips lines with invalid IDs', () => {
    const csv = 'ID,Name,Caught At,Note\ninvalid,Pikachu,2024,Note';
    const result = parseCsvString(csv);
    expect(result).toHaveLength(0);
  });
});