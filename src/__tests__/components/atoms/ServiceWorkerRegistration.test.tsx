import { render } from '@testing-library/react';
import { ServiceWorkerRegistration } from '@/components/atoms/ServiceWorkerRegistration';

describe('ServiceWorkerRegistration', () => {
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    jest.clearAllMocks();
    // Use defineProperty to mock serviceWorker because it's a read-only property
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue({}),
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
    });
  });

  it('registers service worker on mount', () => {
    render(<ServiceWorkerRegistration />);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
  });

  it('does nothing if serviceWorker is not in navigator', () => {
    // Delete serviceWorker from navigator
    // @ts-ignore
    delete navigator.serviceWorker;
    
    render(<ServiceWorkerRegistration />);
    // No error should be thrown
  });

  it('logs warning when registration fails', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const error = new Error('Failed');
    (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(error);

    render(<ServiceWorkerRegistration />);

    // Need to wait for the promise to reject
    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith('SW registration failed:', error);
    consoleSpy.mockRestore();
  });
});
