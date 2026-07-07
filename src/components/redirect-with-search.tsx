import { Navigate, useLocation } from 'react-router';

/**
 * Uudelleenohjaus, joka säilyttää URL:n query-parametrit
 * (korvaa next.config.mjs:n redirectit).
 */
export function RedirectWithSearch({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={{ pathname: to, search }} replace />;
}
