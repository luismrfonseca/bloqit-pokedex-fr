'use client';

import { usePokedex } from '@/context/PokedexContext';

import { usePokemonLoader } from '@/hooks/usePokemonLoader';

export function ProgressOverview() {
  const { total } = usePokemonLoader();
  const { totalCaught, ready } = usePokedex();

  const displayCaught = ready ? totalCaught : 0;
  const pct = total > 0 ? Math.round((displayCaught / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Pokédex Progress</h2>
          <p className="text-sm text-gray-500">
            {displayCaught === 0
              ? 'Start catching Pokémon!'
              : displayCaught === total
              ? 'You caught them all! 🎉'
              : `${total - displayCaught} left to catch`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-red-500">
            {displayCaught}
          </span>
          <span className="text-xl text-gray-400 font-medium"> / {total}</span>
          <p className="text-xs text-gray-400 font-medium">{pct}% complete</p>
        </div>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-400 to-red-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0</span>
        <span>{total}</span>
      </div>
    </div>
  );
}