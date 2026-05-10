import { STAT_DISPLAY_NAMES, StatName } from '@/types/pokemon';

interface StatBarProps {
  name: string;
  value: number;
  max?: number;
}

function statColor(value: number): string {
  if (value >= 100) return '#4ade80';
  if (value >= 70) return '#86efac';
  if (value >= 50) return '#fbbf24';
  if (value >= 30) return '#f97316';
  return '#f87171';
}

export function StatBar({ name, value, max = 255 }: StatBarProps) {
  const displayName = STAT_DISPLAY_NAMES[name as StatName] ?? name;
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs font-medium text-gray-500 text-right shrink-0">
        {displayName}
      </span>
      <span className="w-8 text-xs font-bold text-gray-700 text-right shrink-0">{value}</span>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: statColor(value) }}
        />
      </div>
    </div>
  );
}