'use client';
import { FullSpinner } from '@/components/full-spinner';
import { ErrorView } from '../error-view';
import { useConfiguration } from '@/hooks/useConfiguration';
import { createContext } from 'react';

export const ConfigurationContext = createContext<Record<string, any>>({configuration: {}});

export function ConfigurationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error, refetch, data } = useConfiguration();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      return <ErrorView error={error} reset={refetch} />;
    default:
      return <ConfigurationContext.Provider value={{configuration: data}}>{children}</ConfigurationContext.Provider>;
  }
}
