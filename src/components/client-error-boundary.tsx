'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorView } from './error-view';

export const ClientErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ErrorBoundary
    fallbackRender={({ error }) => {
      return <ErrorView error={error} />;
    }}
  >
    {children}
  </ErrorBoundary>
);
