import { createQueryClient } from '@/lib/queryClient';
import { QueryClient } from '@tanstack/react-query';

describe('createQueryClient', () => {
  it('creates a QueryClient with default options', () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
    
    const options = client.getDefaultOptions().queries;
    expect(options?.staleTime).toBe(Infinity);
    expect(options?.retry).toBe(1);
    expect(options?.refetchOnWindowFocus).toBe(false);
  });
});
