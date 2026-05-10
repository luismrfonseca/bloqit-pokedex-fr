import { apiClient } from '@/lib/api-client';

describe('apiClient', () => {
  it('has correct base configuration', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('interceptor rejects errors', async () => {
    // Interceptor is already registered on the instance
    const error = { response: { status: 404 } };
    try {
      // @ts-ignore - access internal interceptor logic or simulate response
      await apiClient.interceptors.response.handlers[0].rejected(error);
      fail('Should have rejected');
    } catch (e) {
      expect(e).toBe(error);
    }
  });
});
