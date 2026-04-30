'use client';

import Image from 'next/image';

import { PokedexEntry, Pokemon } from '@/types/pokemon';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { officialArtworkUrl } from '@/services/pokemonService';
import { formatName } from '@/utils/share';



interface PokedexGridProps {
  entries: PokedexEntry[];
  pokemonData: Record<number, Pokemon>;
  selected: Set<number>;
  selectMode: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (id: number) => void;
}

export function PokedexGrid({
  entries,
  pokemonData,
  selected,
  selectMode,
  onToggleSelect,
  onOpenDetail,
}: PokedexGridProps) {
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg font-medium">No Pokémon found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {entries.map((entry) => {
        const p = pokemonData[entry.id];
        const isSelected = selected.has(entry.id);


        return (
          <div
            key={entry.id}
            onClick={() => selectMode ? onToggleSelect(entry.id) : onOpenDetail(entry.id)}
            className={`relative bg-white rounded-2xl border-2 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
              isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
          >
            {selectMode && (
              <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}

            <div className="p-4">
              <div className="relative aspect-square w-full mb-2">
                <Image
                  src={officialArtworkUrl(entry.id)}
                  alt={entry.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-gray-400">#{String(entry.id).padStart(3, '0')}</p>
              <h3 className="font-bold text-gray-800 text-sm truncate capitalize mb-1.5">
                {formatName(entry.name)}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
                {p?.types
                  ? p.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)
                  : <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />}
              </div>
              <p className="text-xs text-gray-400">
                {new Date(entry.caughtAt).toLocaleDateString()}
              </p>
              {entry.note && (
                <p className="text-xs text-gray-500 mt-1 truncate italic">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}