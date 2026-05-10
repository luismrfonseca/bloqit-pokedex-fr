import { renderHook, act } from '@testing-library/react';
import { FiltersProvider, useFilters, MAX_HEIGHT, MAX_WEIGHT } from '@/context/FiltersContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <FiltersProvider>{children}</FiltersProvider>
);

describe('FiltersContext', () => {
  it('provides default values', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    expect(result.current.search).toBe('');
    expect(result.current.typeFilter).toBe('');
    expect(result.current.caughtOnly).toBe(false);
    expect(result.current.minHeight).toBe(0);
    expect(result.current.maxHeight).toBe(MAX_HEIGHT);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('updates search query', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setSearch('pikachu');
    });

    expect(result.current.search).toBe('pikachu');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('updates type filter', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setTypeFilter('fire');
    });

    expect(result.current.typeFilter).toBe('fire');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('updates caughtOnly status', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setCaughtOnly(true);
    });

    expect(result.current.caughtOnly).toBe(true);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('updates height and weight bounds', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setMinHeight(10);
      result.current.setMaxWeight(500);
    });

    expect(result.current.minHeight).toBe(10);
    expect(result.current.maxWeight).toBe(500);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });

    act(() => {
      result.current.setSearch('test');
      result.current.setTypeFilter('water');
      result.current.setCaughtOnly(true);
      result.current.clearFilters();
    });

    expect(result.current.search).toBe('');
    expect(result.current.typeFilter).toBe('');
    expect(result.current.caughtOnly).toBe(false);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('throws error when used outside of provider', () => {
    // Suppress console.error for this test as we expect an error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useFilters());
    }).toThrow('useFilters must be used within FiltersProvider');
    
    spy.mockRestore();
  });
});
