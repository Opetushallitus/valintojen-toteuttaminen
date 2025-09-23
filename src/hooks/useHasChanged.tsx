'use client';
import { usePrevious } from '@/hooks/usePrevious';
import { isEmpty } from 'remeda';

export function useHasChanged<T>(
  value: T,
  compare: (a?: T, b?: T) => boolean = (a, b) => a === b,
) {
  const previousValue = usePrevious(value);
  return !compare(value, previousValue);
}

export function useHasChangedForQueryState<T>(
  value: T,
  compare: (a?: T, b?: T) => boolean = (a, b) => a === b,
) {
  const previousValue = usePrevious(value);
  /** querystatea käyttävät useSearchParams hookit asettaa taulukoiden ja listojen sivut 0,
   * mikä aiheuttaa sivusiirtymän joka voi sotkea selaimen navigointia (eteen ja taaksepäin).
   * Tämän takia varmistetaan querystaten arvon olevan asetettu
   **/
  if (previousValue === undefined && typeof value === 'string') {
    return !isEmpty(value);
  }
  return !compare(value, previousValue);
}
