'use client';
import { usePrevious } from '@/hooks/usePrevious';
import { isDeepEqual } from 'remeda';

export function useHasChanged<T>(
  value: T,
  compare: (a?: T, b?: T) => boolean = (a, b) => a === b,
) {
  const previousValue = usePrevious(value);
  return !compare(value, previousValue);
}

export function useHasChangedArray<T>(values: Array<T>) {
  const previousValues = usePrevious(values);
  return (
    previousValues?.length !== values.length ||
    values.some((v, index) => !isDeepEqual(previousValues[index], v))
  );
}
