import { apiClient } from '@/lib/api-client';
import { Pokemon, PokemonListItem } from '@/types/pokemon';

function idFromUrl(url?: string): number {
  if (!url) return 0;
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function slimPokemon(raw: any): Pokemon {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    base_experience: raw.base_experience,
    types: raw.types,
    stats: raw.stats,
    abilities: raw.abilities,
    sprites: {
      front_default: raw.sprites?.front_default ?? null,
      other: {
        'official-artwork': {
          front_default:
            raw.sprites?.other?.['official-artwork']?.front_default ?? null,
        },
      },
    },
  };
}

// ─── Paginated page fetch ─────────────────────────────────────────────────────
export interface PokemonPageResult {
  items: PokemonListItem[];
  hasMore: boolean;
  total: number;
}

export async function fetchPokemonPage(
  offset: number,
  limit = 20
): Promise<PokemonPageResult> {
  const res = await apiClient.get(`/pokemon?limit=${limit}&offset=${offset}`);

  if (res.status === 404) return { items: [], hasMore: false, total: 0 };
  if (res.status !== 200) throw new Error(`Failed to fetch Pokémon page at offset ${offset}`);

  const data = await res.data;
  const items: PokemonListItem[] = (
    data.results as { name: string; url: string }[]
  ).map((item) => ({ name: item.name, url: item.url, id: idFromUrl(item.url) }));

  return {
    items,
    hasMore: data.next !== null && items.length > 0,
    total: data.count ?? 0,
  };
}

// ─── Recursive full-list builder ──────────────────────────────────────────────
export async function fetchCompleteListRecursive(
  onChunk: (items: PokemonListItem[], total: number) => void,
  offset = 0,
  limit = 20
): Promise<void> {
  const page = await fetchPokemonPage(offset, limit);
  if (page.items.length === 0) return;
  onChunk(page.items, page.total);
  if (page.hasMore) {
    await fetchCompleteListRecursive(onChunk, offset + limit, limit);
  }
}


// ─── Individual Pokémon detail fetch ─────────────────────────────────────────
export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const res = await apiClient.get(`/pokemon/${idOrName}`);
  if (res.status !== 200) throw new Error(`Failed to fetch Pokémon: ${idOrName}`);
  return slimPokemon(await res.data);
}

export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
