import { useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Pokemon } from '@/types/pokemon';
import { PokemonCard } from './PokemonCard';
import { useColumns } from '@/hooks/useColumns';

interface PokemonGridProps {
  list: { id: number; name: string }[];
  pokemonMap: Record<number, Pokemon>;
  onOpenDetail: (id: number) => void;
}

export function PokemonGrid({ list, pokemonMap, onOpenDetail }: PokemonGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useColumns();
  const rows = Math.ceil(list.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => 320,
    overscan: 3,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        data-testid="virtual-container"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowEntries = list.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full grid gap-4"
              style={{
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {rowEntries.map((p) => (
                <PokemonCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  pokemon={pokemonMap[p.id] ?? null}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
