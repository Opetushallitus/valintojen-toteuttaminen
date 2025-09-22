'use client';
import { usePrevious } from '@/hooks/usePrevious';
import { isEmpty } from 'remeda';

export function useHasChanged<T>(
  value: T,
  compare: (a?: T, b?: T) => boolean = (a, b) => a === b,
) {
  const previousValue = usePrevious(value);
  if (previousValue === undefined && typeof value === 'string') {
    return !isEmpty(value);
  }
  return !compare(value, previousValue);
}
