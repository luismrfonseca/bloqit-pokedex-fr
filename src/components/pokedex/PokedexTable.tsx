'use client';

import Image from 'next/image';
import { PokedexEntry, Pokemon } from '@/types/pokemon';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { officialArtworkUrl } from '@/services/pokemonService';
import { formatName } from '@/utils/share';



interface PokedexTableProps {
  entries: PokedexEntry[];
  pokemonData: Record<number, Pokemon>;
  selected: Set<number>;
  selectMode: boolean;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onOpenDetail: (id: number) => void;
}

export function PokedexTable({
  entries,
  pokemonData,
  selected,
  selectMode,
  onToggleSelect,
  onSelectAll,
  onOpenDetail,
}: PokedexTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg font-medium">No Pokémon found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  const allSelected = entries.length > 0 && entries.every((e) => selected.has(e.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {selectMode && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pokémon</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Types</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Height</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">HP</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Atk</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Def</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Sp.A</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Sp.D</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Spd</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Caught</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => {
            const p = pokemonData[entry.id];
            const statsMap: Record<string, number> = {};
            p?.stats?.forEach((s) => { statsMap[s.stat.name] = s.base_stat; });
            const isSelected = selected.has(entry.id);

            return (
              <tr
                key={entry.id}
                onClick={() => selectMode ? onToggleSelect(entry.id) : onOpenDetail(entry.id)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                {selectMode && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(entry.id)}
                      className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-gray-400 text-xs font-medium">
                  #{String(entry.id).padStart(3, '0')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        src={officialArtworkUrl(entry.id)}
                        alt={entry.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="font-semibold text-gray-800 capitalize">
                      {formatName(entry.name)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p?.types
                      ? p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)
                      : <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                  {p ? `${(p.height / 10).toFixed(1)}m` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                  {p ? `${(p.weight / 10).toFixed(1)}kg` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums font-medium">
                  {statsMap['hp'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums hidden lg:table-cell">
                  {statsMap['attack'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums hidden lg:table-cell">
                  {statsMap['defense'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums hidden xl:table-cell">
                  {statsMap['special-attack'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums hidden xl:table-cell">
                  {statsMap['special-defense'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums hidden lg:table-cell">
                  {statsMap['speed'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
                  {new Date(entry.caughtAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] hidden md:table-cell">
                  <span className="truncate block italic">
                    {entry.note || '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}