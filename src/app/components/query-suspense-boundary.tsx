'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import {
  ErrorBoundary,
  type ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';
import { ErrorView } from './error-view';
import { FullSpinner } from './spinner';

type FallbackRenderType = ErrorBoundaryPropsWithRender['fallbackRender'];

const defaultFallbackRender: FallbackRenderType = ({
  resetErrorBoundary,
  error,
}) => <ErrorView error={error} reset={resetErrorBoundary} />;

export function QuerySuspenseBoundary({
  children,
  suspenseFallback = <FullSpinner />,
  errorFallbackRender = defaultFallbackRender,
}: {
  children: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  errorFallbackRender?: FallbackRenderType;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={errorFallbackRender ?? defaultFallbackRender}
        >
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
