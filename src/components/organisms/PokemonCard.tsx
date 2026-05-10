'use client';

import React from 'react';
import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { TypeBadge } from '@/components/atoms/TypeBadge';
import { usePokedex } from '@/context/PokedexContext';
import { officialArtworkUrl } from '@/services/pokemonService';
import { formatName } from '@/utils/share';
import { fetchPokemon } from '@/services/pokemonService';

interface PokemonCardProps {
  id: number;
  name: string;
  pokemon: Pokemon | null;
  onOpenDetail: (id: number) => void;
}

export function PokemonCard({ id, name, pokemon, onOpenDetail }: PokemonCardProps) {
  const { isCaught, catchPokemon, releasePokemon } = usePokedex();

  const caught = isCaught(id);

  const [isCatching, setIsCatching] = React.useState(false);

  const handleCatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (caught) {
      releasePokemon(id);
    } else {
      if (pokemon) {
        catchPokemon(pokemon);
      } else {
        setIsCatching(true);
        try {
          const p = await fetchPokemon(id);
          catchPokemon(p);
        } catch (err) {
          console.error('Failed to fetch details for catching', err);
        } finally {
          setIsCatching(false);
        }
      }
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(id)}
      className={`relative bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 ${
        caught ? 'border-green-400 shadow-md' : 'border-gray-200 hover:border-red-300'
      }`}
    >
      {caught && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Caught
        </div>
      )}

      <div className="p-4">
        <div className="relative aspect-square w-full mb-3">
          <Image
            src={officialArtworkUrl(id)}
            alt={name}
            fill
            loading="eager"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain transition-opacity duration-300 ${
              caught ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
            }`}
            unoptimized
          />
        </div>

        <p className="text-xs text-gray-400 font-medium mb-0.5">
          #{String(id).padStart(3, '0')}
        </p>
        <h3 className="font-bold text-gray-800 text-sm mb-2 truncate capitalize">
          {formatName(name)}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
          {pokemon
            ? pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
              ))
            : <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />}
        </div>

        <button
          onClick={handleCatch}
          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            caught
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isCatching ? 'Catching...' : caught ? 'Release' : 'Catch!'}
        </button>
      </div>
    </div>
  );
}