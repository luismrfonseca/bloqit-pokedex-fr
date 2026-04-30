import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PokedexProvider, usePokedex } from '@/context/PokedexContext';
import { Pokemon } from '@/types/pokemon';

// Helper component wiring up all context actions for assertion
function Fixture() {
  const { entries, catchPokemon, releasePokemon, releaseMultiple, updateNote, isCaught, totalCaught } =
    usePokedex();

    const bulbasaure: Pokemon = {
      id: 1,
      name: 'bulbasaur',
      height: 6,
      weight: 85,
      base_experience: 62,
      types: [{ slot: 1, type: { name: 'fire', url: '' } }],
      stats: [{ base_stat: 39, effort: 0, stat: { name: 'hp', url: '' } }],
      sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
      abilities: [],
    };
    const ivysaur: Pokemon = {
      id: 2,
      name: 'ivysaur',
      height: 6,
      weight: 85,
      base_experience: 62,
      types: [{ slot: 1, type: { name: 'fire', url: '' } }],
      stats: [{ base_stat: 39, effort: 0, stat: { name: 'hp', url: '' } }],
      sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
      abilities: [],
    };

  return (
    <div>
      <span data-testid="total">{totalCaught}</span>
      <span data-testid="caught-1">{isCaught(1) ? 'yes' : 'no'}</span>
      <span data-testid="caught-2">{isCaught(2) ? 'yes' : 'no'}</span>
      <span data-testid="note-1">{entries[1]?.note ?? ''}</span>
      <button onClick={() => catchPokemon(bulbasaure)}>catch-1</button>
      <button onClick={() => catchPokemon(ivysaur)}>catch-2</button>
      <button onClick={() => releasePokemon(1)}>release-1</button>
      <button onClick={() => releaseMultiple([1, 2])}>release-all</button>
      <button onClick={() => updateNote(1, 'my note')}>note-1</button>
    </div>
  );
}

function renderFixture() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PokedexProvider>
        <Fixture />
      </PokedexProvider>
    </QueryClientProvider>
  );
}

describe('PokedexContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with 0 caught Pokémon', () => {
    renderFixture();
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('caught-1')).toHaveTextContent('no');
  });

  it('catchPokemon adds an entry and increments totalCaught', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    expect(screen.getByTestId('total')).toHaveTextContent('1');
    expect(screen.getByTestId('caught-1')).toHaveTextContent('yes');
  });

  it('catching the same Pokémon twice does not create a duplicate', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    expect(screen.getByTestId('total')).toHaveTextContent('1');
  });

  it('releasePokemon removes an entry', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'release-1' }));
    expect(screen.getByTestId('caught-1')).toHaveTextContent('no');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('releaseMultiple removes several entries at once', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'catch-2' }));
    expect(screen.getByTestId('total')).toHaveTextContent('2');
    await userEvent.click(screen.getByRole('button', { name: 'release-all' }));
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('caught-1')).toHaveTextContent('no');
    expect(screen.getByTestId('caught-2')).toHaveTextContent('no');
  });

  it('updateNote stores the note text on an existing entry', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'note-1' }));
    expect(screen.getByTestId('note-1')).toHaveTextContent('my note');
  });

  it('preserves the existing note when re-catching the same Pokémon', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'note-1' }));
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    expect(screen.getByTestId('note-1')).toHaveTextContent('my note');
  });

  it('persists entries to localStorage', async () => {
    renderFixture();
    await userEvent.click(screen.getByRole('button', { name: 'catch-1' }));
    const stored = JSON.parse(localStorage.getItem('pokedex_entries') ?? '{}');
    expect(stored[1]).toBeDefined();
    expect(stored[1].name).toBe('bulbasaur');
  });

  it('rehydrates entries from localStorage on mount', async () => {
    localStorage.setItem(
      'pokedex_entries',
      JSON.stringify({ 1: { id: 1, name: 'bulbasaur', caughtAt: '2024-01-01T00:00:00.000Z', note: '' } })
    );
    renderFixture();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(screen.getByTestId('caught-1')).toHaveTextContent('yes');
    expect(screen.getByTestId('total')).toHaveTextContent('1');
  });

  it('throws when used outside PokedexProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Fixture />)).toThrow('usePokedex should be used within PokedexProvider');
    spy.mockRestore();
  });
});