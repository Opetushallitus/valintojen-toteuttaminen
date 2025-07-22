import { describe, it, expect } from 'vitest';
import { useHasChanged } from './useHasChanged';
import { renderHook } from '@testing-library/react';

describe('useHasChanged', () => {
  it('should return true on initial render', () => {
    const value = 42;
    const { result } = renderHook(() => useHasChanged(value));
    expect(result.current).toBe(true);
  });

  it('should return false when value does not change', () => {
    const value = 'test';
    const { result, rerender } = renderHook(() => useHasChanged(value));
    rerender();
    expect(result.current).toBe(false);
  });

  it('should return true when value changes', () => {
    let value = 1;
    const { result, rerender } = renderHook(() => useHasChanged(value));
    rerender();
    expect(result.current).toBe(false);
    value = 2;
    rerender();
    expect(result.current).toBe(true);
  });
});
