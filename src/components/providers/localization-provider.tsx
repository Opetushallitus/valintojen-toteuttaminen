'use client';
import { FullSpinner } from '@/components/full-spinner';
import { useAsiointiKieli } from '@/hooks/useAsiointiKieli';
import { changeLanguage, tolgee } from '@/lib/localization/localizations';
import { ErrorView } from '../error-view';
import { Language } from '@/lib/localization/localization-types';
import { useEffect } from 'react';
import { TolgeeProvider } from '@tolgee/react';

const LocalizationContent = ({
  lng,
  children,
}: {
  lng?: Language;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (lng) {
      changeLanguage(lng);
    }
  }, [lng]);

  return children;
};

export function MyTolgeeProvider({ children }: { children: React.ReactNode }) {
  return (
    <TolgeeProvider tolgee={tolgee} fallback={<FullSpinner />}>
      {children}
    </TolgeeProvider>
  );
}

export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error, data, refetch } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      return <ErrorView error={error} reset={refetch} />;
    default:
      return <LocalizationContent lng={data}>{children}</LocalizationContent>;
  }
}
