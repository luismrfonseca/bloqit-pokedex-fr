'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pokemon } from '@/types/pokemon';
import { TypeBadge } from '@/components/atoms/TypeBadge';
import { StatBar } from '@/components/molecules/StatBar';
import { usePokedex } from '@/context/PokedexContext';
import { sharePokemon, formatName } from '@/utils/share';
import { officialArtworkUrl } from '@/services/pokemonService';

interface PokemonDetailPanelProps {
  pokemon: Pokemon;
}

export function PokemonDetailPanel({ pokemon }: PokemonDetailPanelProps) {
  const { isCaught, catchPokemon, releasePokemon, updateNote, entries } = usePokedex();
  const caught = isCaught(pokemon.id);
  const entry = entries[pokemon.id];

  const storedNote = entry?.note ?? '';
  const [draft, setDraft] = useState<{ pokemonId: number; storedNote: string; value: string } | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);

  const note =
    draft && draft.pokemonId === pokemon.id && draft.storedNote === storedNote
      ? draft.value
      : storedNote;
  const setNote = (value: string) =>
    setDraft({ pokemonId: pokemon.id, storedNote, value });

  const handleCatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (caught) releasePokemon(pokemon.id);
    else catchPokemon(pokemon);
  };
  const handleSaveNote = () => {
    updateNote(pokemon.id, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const headerBg = getBgColor(pokemon.types[0]?.type.name);

  return (
    <div className="flex flex-col">
      <div className="relative flex flex-col items-center pt-10 pb-6 px-6" style={{ background: headerBg }}>
        <div className="relative w-40 h-40 mb-4 drop-shadow-2xl">
          <Image
            src={officialArtworkUrl(pokemon.id)}
            alt={pokemon.name}
            fill
            sizes="160px"
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-sm text-white/70 font-medium">#{String(pokemon.id).padStart(3, '0')}</p>
        <h2 className="text-2xl font-extrabold text-white mb-3">{formatName(pokemon.name)}</h2>
        <div className="flex gap-2">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <InfoTile label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} />
          <InfoTile label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Base Stats
          </h3>
          <div className="flex flex-col gap-2.5">
            {pokemon.stats.map((s) => (
              <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
            ))}
          </div>
        </div>

        {caught && entry && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">
              First Caught
            </p>
            <p className="text-sm text-green-800 font-medium">
              {new Date(entry.caughtAt).toLocaleString()}
            </p>
          </div>
        )}

        {caught && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a personal note about this Pokémon..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
            <button
              onClick={handleSaveNote}
              className="mt-2 px-4 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              {noteSaved ? '✓ Saved' : 'Save Note'}
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCatch}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              caught
                ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200'
            }`}
          >
            {caught ? '✕ Release' : '⊕ Catch!'}
          </button>
          <button
            onClick={() => sharePokemon(pokemon)}
            className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
  );
}

function getBgColor(type: string | undefined): string {
  const map: Record<string, string> = {
    fire: 'linear-gradient(135deg, #F08030 0%, #e84e0f 100%)',
    water: 'linear-gradient(135deg, #6890F0 0%, #4a6fd8 100%)',
    grass: 'linear-gradient(135deg, #78C850 0%, #5a9e35 100%)',
    electric: 'linear-gradient(135deg, #F8D030 0%, #e6b800 100%)',
    psychic: 'linear-gradient(135deg, #F85888 0%, #e03060 100%)',
    ice: 'linear-gradient(135deg, #98D8D8 0%, #70b8b8 100%)',
    dragon: 'linear-gradient(135deg, #7038F8 0%, #5020d8 100%)',
    dark: 'linear-gradient(135deg, #705848 0%, #503830 100%)',
    fairy: 'linear-gradient(135deg, #EE99AC 0%, #d87090 100%)',
    fighting: 'linear-gradient(135deg, #C03028 0%, #a01818 100%)',
    poison: 'linear-gradient(135deg, #A040A0 0%, #802880 100%)',
    ground: 'linear-gradient(135deg, #E0C068 0%, #c8a050 100%)',
    flying: 'linear-gradient(135deg, #A890F0 0%, #8878d8 100%)',
    bug: 'linear-gradient(135deg, #A8B820 0%, #889800 100%)',
    rock: 'linear-gradient(135deg, #B8A038 0%, #988020 100%)',
    ghost: 'linear-gradient(135deg, #705898 0%, #504078 100%)',
    steel: 'linear-gradient(135deg, #B8B8D0 0%, #9898b8 100%)',
    normal: 'linear-gradient(135deg, #A8A878 0%, #888858 100%)',
  };
  return map[type ?? ''] ?? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
}