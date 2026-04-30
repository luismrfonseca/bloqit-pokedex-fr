import { Pokemon } from '@/types/pokemon';

export async function sharePokemon(pokemon: Pokemon): Promise<void> {
  const url = `${window.location.origin}?pokemon=${pokemon.id}`;
  const text = `Check out ${formatName(pokemon.name)}! Types: ${pokemon.types.map((t) => t.type.name).join(', ')}`;

  if (navigator.share) {
    await navigator.share({ title: formatName(pokemon.name), text, url });
  } else {
    await navigator.clipboard.writeText(`${text} — ${url}`);
    alert('Link copied to clipboard!');
  }
}

export function formatName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}