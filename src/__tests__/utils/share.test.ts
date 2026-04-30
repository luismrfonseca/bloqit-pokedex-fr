import { formatName } from '@/utils/share';

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