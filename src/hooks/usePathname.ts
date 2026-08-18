import { useLocation } from 'react-router';
import { BASE_PATH } from '@/lib/base-path';

/**
 * Palauttaa polun ilman sovelluksen base-polkua
 * (kuten Next.js:n usePathname basePathin kanssa).
 */
export function usePathname() {
  const { pathname } = useLocation();
  return pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length)
    : pathname;
}
