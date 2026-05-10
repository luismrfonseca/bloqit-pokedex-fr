# Estrutura do Projeto e Decisões Técnicas

Este documento detalha a arquitetura técnica, as dependências utilizadas e as decisões tomadas durante o desenvolvimento do Bloqit Pokedex.

## 1. Stack Tecnológica e Packages

### Core
- **Next.js 16 (App Router)**: Framework principal para React com suporte a Server Components, otimização de imagens e roteamento avançado.
- **React 19**: Biblioteca de interface, utilizando as funcionalidades mais recentes de concorrência e o novo React Compiler.
- **TypeScript**: Garantia de tipagem estática em todo o projeto, essencial para a integridade dos dados dos Pokémon.

### Gestão de Dados e Estado
- **TanStack Query (React Query) v5**: Gerir o estado assíncrono (fetching, caching, sincronização). É a peça central para lidar com a PokeAPI de forma eficiente.
- **idb-keyval**: Abstração leve para o **IndexedDB**, escolhido devido à sua natureza assíncrona e maior capacidade de armazenamento que o LocalStorage.
- **@tanstack/react-query-persist-client**: Implementar persistência de cache para suporte offline e carregamento instantâneo.

### Performance e Escala
- **@tanstack/react-virtual v3**: 
  - *Razão*: Implementar **Virtualização de Lista**. Essencial para renderizar mais de 1000 Pokémon na Home sem degradar a performance do browser, mantendo apenas os elementos visíveis no DOM.

### Estilização e UI
- **Tailwind CSS 4**: Estilização rápida através de utilitários, garantindo um design responsivo e consistente.

## 2. Decisões Técnicas e Arquitetura

### 2.1 Design Pattern: Atomic Design
O projeto foi refatorado para seguir a metodologia **Atomic Design**, promovendo a reutilização de componentes e a manutenibilidade:
- `src/components/atoms/`: Componentes base (Botões, Badges, Inputs).
- `src/components/molecules/`: Grupos de átomos (Barras de estatísticas, Toggles de vista).
- `src/components/organisms/`: Organismos complexos (Card de Pokémon, Navbar, Painéis de Filtros).
- `src/components/templates/`: Estruturas de layout de página.

### 2.2 Estratégia de Cache "Offline-First"
Utilização de **staleTime: Infinity** para os dados dos Pokémon. Uma vez que os dados são estáticos, após o primeiro carregamento, a aplicação funciona inteiramente a partir do cache local IndexedDB.

### 2.3 Filtros Granulares e Avançados
Implementação de um sistema de filtros avançado que permite:
- Pesquisa textual por nome ou ID.
- Filtragem por tipo (e.g., Fire, Water).
- **Filtros Granulares de Altura e Peso**: Sliders intuitivos que permitem filtrar Pokémon por intervalos físicos (ex: Pokémon com mais de 2.0m).

### 2.4 Sistema de Backup (Importação/Exportação CSV)
Desenvolvimento de uma utilidade personalizada em `src/utils/csv.ts` que permite ao utilizador:
- Exportar a sua Pokédex pessoal e notas para um ficheiro CSV.
- Importar backups, restaurando a coleção e as notas persistidas. O parser lida de forma robusta com campos complexos e caracteres especiais.

## 3. Otimização de Performance
- **Virtualização**: Renderização eficiente de listas massivas.
- **Normalização de Dados**: Função `slimPokemon` para reduzir o tamanho dos objetos em cache.
- **React Compiler**: Otimização automática de memoization.
- **Layout Shift Zero**: Uso de placeholders e dimensões fixas para evitar saltos de layout durante o carregamento de imagens.

### 4. Testes Automatizados
O projeto utiliza uma estratégia de testes em pirâmide para garantir estabilidade:

- **Unitários (Jest + RTL):** Cobertura de >90% do código. Focado em lógica de negócios (`utils`), estados globais (`contexts`), hooks customizados e componentes individuais.
- **E2E (Playwright):** Validação do fluxo crítico "Catch & Note". Testa a integração real entre o banco de dados local (IDB), a UI e a API (via mocks de rede se necessário).
- **Cobertura:** Comando `npm run test:coverage` para monitorização contínua da qualidade.

### 5. Configurações e DevOps
- **Next.js 15:** App Router para routing moderno.
- **Tailwind CSS:** Styling responsivo e eficiente.
- **PWA:** Suporte offline e instalação via Service Workers.
- **CI/CD:** GitHub Actions configurado para linting e testes antes de qualquer deploy.
2. Execução de testes Jest.
3. Build de produção.
4. Deployment automático para a **Vercel** apenas após sucesso nos passos anteriores.
