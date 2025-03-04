'use client';
import { I18nextProvider } from 'react-i18next';
import { FullSpinner } from '@/components/full-spinner';
import { useAsiointiKieli } from '@/hooks/useAsiointiKieli';
import { createLocalization } from '@/lib/localization/localizations';
import { ErrorView } from '../error-view';
import { useEffect } from 'react';

const localizations = createLocalization();

const LocalizationContent = ({
  lng,
  children,
}: {
  lng?: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    localizations.changeLanguage(lng ?? 'fi');
  }, [lng]);
  return <I18nextProvider i18n={localizations}>{children}</I18nextProvider>;
};

export default function LocalizationProvider({
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
