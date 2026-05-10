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

export function parseCsvString(csv: string): Partial<PokedexEntry>[] {
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const idIdx = headers.indexOf('ID');
  const nameIdx = headers.indexOf('Name');
  const caughtAtIdx = headers.indexOf('Caught At');
  const noteIdx = headers.indexOf('Note');

  if (idIdx === -1) return [];

  return lines.slice(1).map(line => {
    const parts = parseCsvLine(line);
    
    return {
      id: parseInt(parts[idIdx]),
      name: parts[nameIdx] || '',
      caughtAt: parts[caughtAtIdx] ? new Date(parts[caughtAtIdx]).toISOString() : new Date().toISOString(),
      note: parts[noteIdx] || '',
    };
  }).filter(e => !isNaN(e.id as number));
}

function parseCsvLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
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