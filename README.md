# ⚡ Bloqit Pokédex

![CI/CD Pipeline](https://github.com/luismrfonseca/bloqit-pokedex-fr/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

A modern, offline-first Pokédex web application built with **Next.js**, **React Query**, and **Tailwind CSS**. Designed to be fast, responsive, and fully functional even without an internet connection using IndexedDB caching.

## ✨ Features

- **Pokédex Grid & Table**: Browse Pokémon with smooth pagination and detailed views.
- **Offline-First Capabilities**: Uses `@tanstack/react-query-persist-client` and `idb-keyval` to store API responses locally, allowing users to browse previously viewed Pokémon without a network connection.
- **Optimized Data Fetching**: Powered by Axios with `axios-cache-interceptor` and TanStack Query.
- **Responsive UI**: Fully styled with Tailwind CSS v4 for mobile, tablet, and desktop views.
- **Robust Testing**: Comprehensive unit test suite using Jest to guarantee service reliability.
- **Automated CI/CD**: GitHub Actions pipeline for automated linting, testing, and seamless deployments to Vercel.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching & State**: [TanStack Query v5](https://tanstack.com/query/latest), [Axios](https://axios-http.com/)
- **Caching & Offline**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), `idb-keyval`, `axios-cache-interceptor`
- **Testing**: [Jest](https://jestjs.io/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v20+) and your preferred package manager (`npm`, `yarn`, `pnpm`, or `bun`) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luismrfonseca/bloqit-pokedex-fr.git
   cd bloqit-pokedex-fr

2. Install dependencies:

```bash
npm install 
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.


## 📂 Project Structure

```
├── .github/workflows/   # CI/CD pipeline configurations (ci.yml)
├── src/
│   ├── __tests__/       # Unit tests for services and components
│   ├── app/             # Next.js App Router pages and layouts
│   ├── components/      # Reusable React components (PokemonCard, PokedexTable, etc.)
|   |-- context/         # Context API for state management
│   |-- hooks/           # Custom React hooks (usePokemonDetail, etc.)
│   |-- lib/             # Utility functions and Axios setup
|   |-- providers/       # Providers for React Query
│   |--services/        # API communication and data transformation logic
│   |-- types/           # Type definitions
│   |-- utils/           # Utility functions    
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## 🧪 Testing

This project uses Jest for unit testing.

To run the test suite:

```bash
# Run tests once
npm run test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Generate a coverage report
npm run test:coverage
```

## 🚀 CI/CD & Deployment

This project uses GitHub Actions (.github/workflows/ci.yml) to ensure code quality. The pipeline includes:

1. Linting: Ensures code consistency using ESLint.
2. Testing: Runs the Jest unit test suite.
3. Build: Builds the Next.js application.
4. Deploy: Automatically deploys the main branch to Vercel only if all previous steps pass.

## Built by

[Luis Fonseca](https://github.com/luismrfonseca)    


