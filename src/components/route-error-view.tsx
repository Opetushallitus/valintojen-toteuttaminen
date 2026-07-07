import { useRouteError } from 'react-router';
import { ErrorView } from './error-view';

/**
 * Reittikohtainen virhenäkymä (korvaa Next.js:n error.tsx-konvention).
 */
export function RouteErrorView() {
  const error = useRouteError();
  return (
    <ErrorView error={error as Error} reset={() => window.location.reload()} />
  );
}
