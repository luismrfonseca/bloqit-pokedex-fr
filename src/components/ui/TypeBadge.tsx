import { TYPE_COLORS } from '@/types/pokemon';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const bg = TYPE_COLORS[type] ?? '#888';
  const cls =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs rounded font-semibold text-white capitalize'
      : 'px-3 py-1 text-xs rounded-full font-semibold text-white capitalize tracking-wide';
  return (
    <span className={cls} style={{ backgroundColor: bg }}>
      {type}
    </span>
  );
}