'use client';
import { I18nextProvider } from 'react-i18next';
import { FullSpinner } from './components/full-spinner';
import { useAsiointiKieli } from './hooks/useAsiointiKieli';
import { createLocalization } from './lib/localization/localizations';

const localizations = createLocalization();

export default function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error, data } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      localizations.changeLanguage(data ?? 'fi');
      return <I18nextProvider i18n={localizations}>{children}</I18nextProvider>;
  }
}
