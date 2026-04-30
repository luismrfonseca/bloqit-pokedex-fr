import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { PokedexProvider } from '@/context/PokedexContext';
import { Pokemon } from '@/types/pokemon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const mockPokemon: Pokemon = {
  id: 4,
  name: 'charmander',
  height: 6,
  weight: 85,
  base_experience: 62,
  types: [{ slot: 1, type: { name: 'fire', url: '' } }],
  stats: [{ base_stat: 39, effort: 0, stat: { name: 'hp', url: '' } }],
  sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
  abilities: [],
};

function renderCard(overrides: Partial<Parameters<typeof PokemonCard>[0]> = {}) {
  const props = {
    id: 4,
    name: 'charmander',
    pokemon: mockPokemon,
    onOpenDetail: jest.fn(),
    ...overrides,
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PokedexProvider>
        <PokemonCard {...props} />
      </PokedexProvider>
    </QueryClientProvider>
  );
}

describe('PokemonCard', () => {
  beforeEach(() => localStorage.clear());

  it('renders the Pokémon name formatted', () => {
    renderCard();
    expect(screen.getByText('Charmander')).toBeInTheDocument();
  });

  it('renders the Pokémon number with leading zeros', () => {
    renderCard();
    expect(screen.getByText('#004')).toBeInTheDocument();
  });

  it('renders the type badge when pokemon data is provided', () => {
    renderCard();
    expect(screen.getByText('fire')).toBeInTheDocument();
  });

  it('shows a loading skeleton when pokemon data is null', () => {
    const { container } = renderCard({ pokemon: null });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows Catch! button when Pokémon is not caught', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /catch/i })).toBeInTheDocument();
  });

  it('marks as caught and shows Release button after clicking Catch', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /catch/i }));
    expect(screen.getByRole('button', { name: /release/i })).toBeInTheDocument();
    expect(screen.getByText('Caught')).toBeInTheDocument();
  });

  it('calls onOpenDetail when the card is clicked', async () => {
    const onOpenDetail = jest.fn();
    renderCard({ onOpenDetail });
    await userEvent.click(screen.getByText('Charmander'));
    expect(onOpenDetail).toHaveBeenCalledWith(4);
  });

  it('does not call onOpenDetail when the catch button is clicked', async () => {
    const onOpenDetail = jest.fn();
    renderCard({ onOpenDetail });
    await userEvent.click(screen.getByRole('button', { name: /catch/i }));
    expect(onOpenDetail).not.toHaveBeenCalled();
  });

  it('releases a caught Pokémon when Release is clicked', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /catch/i }));
    await userEvent.click(screen.getByRole('button', { name: /release/i }));
    expect(screen.getByRole('button', { name: /catch/i })).toBeInTheDocument();
  });
});