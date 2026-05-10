import { renderHook, act } from '@testing-library/react';
import { useColumns } from '@/hooks/useColumns';

describe('useColumns', () => {
  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('returns 2 for mobile', () => {
    setWidth(500);
    const { result } = renderHook(() => useColumns());
    expect(result.current).toBe(2);
  });

  it('returns 3 for small screens', () => {
    setWidth(700);
    const { result } = renderHook(() => useColumns());
    expect(result.current).toBe(3);
  });

  it('returns 4 for large screens', () => {
    setWidth(1100);
    const { result } = renderHook(() => useColumns());
    expect(result.current).toBe(4);
  });

  it('returns 5 for extra large screens', () => {
    setWidth(1300);
    const { result } = renderHook(() => useColumns());
    expect(result.current).toBe(5);
  });

  it('updates columns on resize', () => {
    setWidth(500);
    const { result } = renderHook(() => useColumns());
    expect(result.current).toBe(2);

    act(() => {
      setWidth(1300);
    });

    expect(result.current).toBe(5);
  });
});
