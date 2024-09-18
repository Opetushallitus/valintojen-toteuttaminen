/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useLayoutEffect, useMemo, useRef } from 'react';

export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number,
) => {
  let timeout = 0;
  return (...args: Parameters<T>): ReturnType<T> => {
    let result: any;
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      result = callback(...args);
    }, waitFor);
    return result;
  };
};

export function useDebounce(callback: any, delay: number) {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(
    () => debounce((...args) => callbackRef.current(...args), delay),
    [delay],
  );
}
