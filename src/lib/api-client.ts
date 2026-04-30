import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.BASE_URL || 'https://pokeapi.co/api/v2',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);