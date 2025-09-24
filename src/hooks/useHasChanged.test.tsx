import { describe, it, expect } from 'vitest';
import { useHasChanged, useHasChangedForQueryState } from './useHasChanged';
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

describe('useHasChangedForQueryState', () => {
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

  it('should return false if original value is undefinend and new value is empty string', () => {
    let value: string | undefined = undefined;
    const { result, rerender } = renderHook(() =>
      useHasChangedForQueryState(value),
    );
    value = '';
    rerender();
    expect(result.current).toBe(false);
  });
});
