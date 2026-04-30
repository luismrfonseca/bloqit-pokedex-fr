import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { PokedexProvider } from '@/context/PokedexContext';
import { FiltersProvider } from '@/context/FiltersContext';
import { Navbar } from '@/components/layout/Navbar';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Pokédex Tracker',
  description: 'Track your Pokémon journey — catch, manage and share your Pokédex.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <ServiceWorkerRegistration />
        <QueryProvider>
          <PokedexProvider>
            <FiltersProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
                <p className="text-center text-xs text-gray-400">
                  Data from{' '}
                  <a
                    href="https://pokeapi.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline"
                  >
                    PokéAPI
                  </a>{' '}
                  · Pokémon and Pokémon character names are trademarks of Nintendo.
                </p>
              </footer>
            </FiltersProvider>
          </PokedexProvider>
        </QueryProvider>
      </body>
    </html>
  );
}