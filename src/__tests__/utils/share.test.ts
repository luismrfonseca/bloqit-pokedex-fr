import { formatName, sharePokemon } from '@/utils/share';
import { Pokemon } from '@/types/pokemon';

describe('formatName', () => {
  it('capitalises a single lowercase word', () => {
    expect(formatName('bulbasaur')).toBe('Bulbasaur');
  });

  it('capitalises every word in a hyphenated name', () => {
    expect(formatName('mr-mime')).toBe('Mr Mime');
  });

  it('handles triple hyphenated names', () => {
    expect(formatName('ho-oh')).toBe('Ho Oh');
  });

  it('leaves already-capitalised names unchanged in result', () => {
    expect(formatName('pikachu')).toBe('Pikachu');
  });

  it('handles single-character segments', () => {
    expect(formatName('a-b')).toBe('A B');
  });
});

describe('sharePokemon', () => {
  const mockPokemon = {
    id: 1,
    name: 'bulbasaur',
    types: [{ type: { name: 'grass' } }],
  } as Pokemon;

  beforeEach(() => {
    global.alert = jest.fn();
    (navigator as any).share = undefined;
    (navigator as any).clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };
  });

  it('uses navigator.share when available', async () => {
    const shareMock = jest.fn().mockResolvedValue(undefined);
    (navigator as any).share = shareMock;

    await sharePokemon(mockPokemon);

    expect(shareMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Bulbasaur',
      url: 'http://localhost?pokemon=1'
    }));
  });

  it('falls back to clipboard when navigator.share is missing', async () => {
    await sharePokemon(mockPokemon);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Bulbasaur')
    );
    expect(global.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });
});