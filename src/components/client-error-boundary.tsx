'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorView } from './error-view';

export const ClientErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => {
      return <ErrorView error={error} reset={resetErrorBoundary} />;
    }}
  >
    {children}
  </ErrorBoundary>
);
