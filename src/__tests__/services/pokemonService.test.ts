import { apiClient } from '@/lib/api-client';
import {
  fetchPokemonPage,
  fetchCompleteListRecursive,
  fetchPokemon,
  officialArtworkUrl,
} from '@/services/pokemonService';

// Mock the apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('pokemonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPokemonPage', () => {
    it('returns a page of Pokémon on success', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          count: 150,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      });

      const result = await fetchPokemonPage(0, 2);

      expect(apiClient.get).toHaveBeenCalledWith('/pokemon?limit=2&offset=0');
      expect(result).toEqual({
        items: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/', id: 1 },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/', id: 2 },
        ],
        hasMore: true,
        total: 150,
      });
    });

    it('returns empty result when status is 404', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 404,
      });

      const result = await fetchPokemonPage(0, 20);

      expect(result).toEqual({
        items: [],
        hasMore: false,
        total: 0,
      });
    });

    it('throws an error when status is not 200 or 404', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 500,
      });

      await expect(fetchPokemonPage(0, 20)).rejects.toThrow('Failed to fetch Pokémon page at offset 0');
    });

    it('handles hasMore correctly when next is null', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          ],
        },
      });

      const result = await fetchPokemonPage(0, 20);

      expect(result.hasMore).toBe(false);
    });
  });

  describe('fetchCompleteListRecursive', () => {
    it('fetches recursively until all pages are retrieved', async () => {
      // First call mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          count: 3,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=2',
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      });

      // Second call mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          count: 3,
          next: null,
          results: [
            { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
          ],
        },
      });

      const onChunk = jest.fn();

      await fetchCompleteListRecursive(onChunk, 0, 2);

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenNthCalledWith(1, '/pokemon?limit=2&offset=0');
      expect(apiClient.get).toHaveBeenNthCalledWith(2, '/pokemon?limit=2&offset=2');

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/', id: 1 },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/', id: 2 },
      ], 3);
      expect(onChunk).toHaveBeenNthCalledWith(2, [
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/', id: 3 },
      ], 3);
    });

    it('stops fetching when items are empty', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { count: 0, next: null, results: [] },
      });

      const onChunk = jest.fn();

      await fetchCompleteListRecursive(onChunk, 0, 20);

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(onChunk).not.toHaveBeenCalled();
    });
  });

  describe('fetchPokemon', () => {
    it('returns formatted (slim) Pokémon data on success', async () => {
      const rawPokemon = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        base_experience: 112,
        types: [{ slot: 1, type: { name: 'electric', url: '...' } }],
        stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp', url: '...' } }],
        abilities: [{ ability: { name: 'static', url: '...' }, is_hidden: false, slot: 1 }],
        sprites: {
          front_default: 'front.png',
          other: {
            'official-artwork': {
              front_default: 'artwork.png',
            },
          },
          // Extra unnecessary data
          back_default: 'back.png',
        },
        // Extra unnecessary data
        species: { name: 'pikachu', url: '...' },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: rawPokemon,
      });

      const pokemon = await fetchPokemon(25);

      expect(apiClient.get).toHaveBeenCalledWith('/pokemon/25');
      expect(pokemon).toEqual({
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        base_experience: 112,
        types: rawPokemon.types,
        stats: rawPokemon.stats,
        abilities: rawPokemon.abilities,
        sprites: {
          front_default: 'front.png',
          other: {
            'official-artwork': {
              front_default: 'artwork.png',
            },
          },
        },
      });
    });

    it('handles missing sprites data gracefully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          id: 1,
          name: 'bulbasaur',
          // missing sprites entirely
        },
      });

      const pokemon = await fetchPokemon(1);

      expect(pokemon.sprites).toEqual({
        front_default: null,
        other: {
          'official-artwork': {
            front_default: null,
          },
        },
      });
    });

    it('throws an error when status is not 200', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 404,
      });

      await expect(fetchPokemon(9999)).rejects.toThrow('Failed to fetch Pokémon: 9999');
    });
  });

  describe('officialArtworkUrl', () => {
    it('returns the correct URL format', () => {
      expect(officialArtworkUrl(1)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png');
      expect(officialArtworkUrl(25)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png');
    });
  });
});
