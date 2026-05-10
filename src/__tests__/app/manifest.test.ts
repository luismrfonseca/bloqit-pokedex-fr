import manifest from '@/app/manifest';

describe('manifest', () => {
  it('returns correct manifest object', () => {
    const result = manifest();
    expect(result.name).toBe('Pokédex Tracker');
    expect(result.short_name).toBe('Pokédex');
    expect(result.start_url).toBe('/');
    expect(result.display).toBe('standalone');
    expect(result.icons).toHaveLength(2);
    expect(result.shortcuts).toHaveLength(1);
  });
});
