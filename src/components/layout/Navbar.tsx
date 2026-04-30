'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePokedex } from '@/context/PokedexContext';
import { useFilters } from '@/context/FiltersContext';
import { TYPE_COLORS } from '@/types/pokemon';

const ALL_TYPES = Object.keys(TYPE_COLORS);

export function Navbar() {
  const pathname = usePathname();
  const { totalCaught, totalPokemon } = usePokedex();
  const { search, setSearch, typeFilter, setTypeFilter, caughtOnly, setCaughtOnly, clearFilters, hasActiveFilters } = useFilters();

  const onHome = pathname === '/';

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? 'bg-white/20 text-white'
            : 'text-red-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-red-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Row 1 — logo · nav · caught */}
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Pokeball />
            </div>
            <span className="text-white font-bold text-base tracking-wide hidden sm:block">
              Pokédex Tracker
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLink('/', 'All Pokémon')}
            {navLink('/pokedex', 'My Pokédex')}
            <div className="ml-2 flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-xs text-red-100 font-medium hidden sm:block">Caught</span>
              <span className="text-white font-bold text-sm">
                {totalCaught}
                <span className="text-red-200 font-normal">
                  /{totalPokemon > 0 ? totalPokemon : '…'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Row 2 — filters (only on home page) */}
        {onHome && (
          <div className="flex items-center gap-2 pb-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-36">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white/15 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:bg-white/25 focus:border-white/40 transition-colors"
            >
              <option value="" className="text-gray-900">All Types</option>
              {ALL_TYPES.map((t) => (
                <option key={t} value={t} className="text-gray-900">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            {/* Caught only */}
            <button
              onClick={() => setCaughtOnly((v) => !v)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                caughtOnly
                  ? 'bg-white text-red-600 border-white'
                  : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              }`}
            >
              {caughtOnly ? '✓ Caught' : 'Caught only'}
            </button>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-white/60 hover:text-white underline transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function Pokeball() {
  return (
    <svg viewBox="0 0 40 40" className="w-5 h-5">
      <circle cx="20" cy="20" r="18" fill="#e53e3e" />
      <path d="M2 20 Q2 2 20 2 Q38 2 38 20" fill="#e53e3e" />
      <path d="M2 20 Q2 38 20 38 Q38 38 38 20" fill="white" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="#2d3748" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="5" fill="white" stroke="#2d3748" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="2.5" fill="#2d3748" />
    </svg>
  );
}