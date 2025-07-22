import { describe, it, expect } from 'vitest';
import { useHasChanged, useHasChangedArray } from './useHasChanged';
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

describe('useHasChangedArray', () => {
  it('should return true on initial render', () => {
    const value = [42, 33];
    const { result } = renderHook(() => useHasChangedArray(value));
    expect(result.current).toBe(true);
  });

  it('should return false when value does not change', () => {
    const value = ['ruhtinas', 'nukettaja'];
    const { result, rerender } = renderHook(() => useHasChangedArray(value));
    rerender();
    expect(result.current).toBe(false);
  });

  it('should return true when value changes', () => {
    let value = [1, 3];
    const { result, rerender } = renderHook(() => useHasChangedArray(value));
    rerender();
    expect(result.current).toBe(false);
    value = [2, 3];
    rerender();
    expect(result.current).toBe(true);
  });

  it('should return true if object value changes', () => {
    let value = [
      { key: 1, name: 'Dacula' },
      { key: 3, name: 'Kreivi' },
    ];
    const { result, rerender } = renderHook(() => useHasChangedArray(value));
    rerender();
    expect(result.current).toBe(false);
    value = [
      { key: 2, name: 'Dacula' },
      { key: 3, name: 'Kreivi' },
    ];
    rerender();
    expect(result.current).toBe(true);
  });

  it('should return true if order of items has changed', () => {
    let value = [
      { key: 1, name: 'Dacula' },
      { key: 3, name: 'Kreivi' },
    ];
    const { result, rerender } = renderHook(() => useHasChangedArray(value));
    rerender();
    expect(result.current).toBe(false);
    value = [
      { key: 3, name: 'Kreivi' },
      { key: 1, name: 'Dacula' },
    ];
    rerender();
    expect(result.current).toBe(true);
  });
});
