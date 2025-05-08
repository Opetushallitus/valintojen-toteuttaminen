'use client';
import { FullSpinner } from '@/components/full-spinner';
import { ErrorView } from '../error-view';
import { useConfiguration } from '@/hooks/useConfiguration';

export function ConfigurationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error, refetch } = useConfiguration();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      return <ErrorView error={error} reset={refetch} />;
    default:
      return <>{children}</>;
  }
}
