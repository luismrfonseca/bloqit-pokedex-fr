import { PokedexEntry, Pokemon } from '@/types/pokemon';

const HEADERS = [
  'ID', 'Name', 'Types', 'Height (m)', 'Weight (kg)',
  'HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed',
  'Caught At', 'Note',
];

export function buildCsvString(
  entries: PokedexEntry[],
  pokemonData: Record<number, Pokemon>
): string {
  const rows = entries.map((entry) => {
    const p = pokemonData[entry.id];
    const statsMap: Record<string, number> = {};
    p?.stats.forEach((s) => { statsMap[s.stat.name] = s.base_stat; });

    return [
      entry.id,
      entry.name,
      p ? p?.types?.map((t) => t.type.name).join('+') : '',
      p ? (p.height / 10).toFixed(1) : '',
      p ? (p.weight / 10).toFixed(1) : '',
      statsMap['hp'] ?? '',
      statsMap['attack'] ?? '',
      statsMap['defense'] ?? '',
      statsMap['special-attack'] ?? '',
      statsMap['special-defense'] ?? '',
      statsMap['speed'] ?? '',
      new Date(entry.caughtAt).toLocaleString(),
      `"${entry.note.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [HEADERS.join(','), ...rows].join('\n');
}

export function exportToCsv(
  entries: PokedexEntry[],
  pokemonData: Record<number, Pokemon>
): void {
  const csv = buildCsvString(entries, pokemonData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pokedex_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}