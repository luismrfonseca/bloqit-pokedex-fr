import { useRef } from 'react';
import Image from 'next/image';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { PokedexEntry, Pokemon } from '@/types/pokemon';
import { TypeBadge } from '@/components/atoms/TypeBadge';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: entries.length,
    estimateSize: () => 64, // Estimated height of a table row
    overscan: 10,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

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
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={containerRef} className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
          <tr>
            {selectMode && (
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">Pokémon</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Types</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Height</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Weight</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">HP</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 hidden lg:table-cell">Atk</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 hidden lg:table-cell">Def</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 hidden xl:table-cell">Sp.A</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 hidden xl:table-cell">Sp.D</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 hidden lg:table-cell">Spd</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 hidden md:table-cell">Caught</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px] hidden md:table-cell">Note</th>
          </tr>
        </thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const entry = entries[virtualRow.index];
            const p = pokemonData[entry.id];
            const statsMap: Record<string, number> = {};
            p?.stats?.forEach((s) => { statsMap[s.stat.name] = s.base_stat; });
            const isSelected = selected.has(entry.id);

            return (
              <tr
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                onClick={() => selectMode ? onToggleSelect(entry.id) : onOpenDetail(entry.id)}
                className={`absolute left-0 w-full flex items-center border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                }}
              >
                {selectMode && (
                  <td className="px-4 py-3 w-12 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(entry.id)}
                      className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-gray-400 text-xs font-medium w-16 shrink-0">
                  #{String(entry.id).padStart(3, '0')}
                </td>
                <td className="px-4 py-3 min-w-[200px] flex-1">
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
                    <span className="font-semibold text-gray-800 capitalize truncate">
                      {formatName(entry.name)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[120px] shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {p?.types
                      ? p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)
                      : <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-20 shrink-0">
                  {p ? `${(p.height / 10).toFixed(1)}m` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-20 shrink-0">
                  {p ? `${(p.weight / 10).toFixed(1)}kg` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums font-medium w-16 shrink-0">
                  {statsMap['hp'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-16 shrink-0 hidden lg:block">
                  {statsMap['attack'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-16 shrink-0 hidden lg:block">
                  {statsMap['defense'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-16 shrink-0 hidden xl:block">
                  {statsMap['special-attack'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-16 shrink-0 hidden xl:block">
                  {statsMap['special-defense'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 tabular-nums w-16 shrink-0 hidden lg:block">
                  {statsMap['speed'] ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap w-32 shrink-0 hidden md:block">
                  {new Date(entry.caughtAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs min-w-[150px] flex-1 hidden md:block">
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