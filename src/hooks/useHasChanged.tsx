'use client';
import { usePrevious } from '@/hooks/usePrevious';

export function useHasChanged<T>(
  value: T,
  compare: (a?: T, b?: T) => boolean = (a, b) => a === b,
) {
  const previousValue = usePrevious(value);
  return !compare(value, previousValue);
}
