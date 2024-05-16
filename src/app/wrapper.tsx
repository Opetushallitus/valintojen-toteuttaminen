'use client';
import { I18nextProvider } from 'react-i18next';
import { FullSpinner } from './components/full-spinner';
import { useAsiointiKieli } from './hooks/useAsiointiKieli';
import { createLocalization } from './lib/localization/localizations';

const localization = createLocalization();

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, error, data } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      localization.changeLanguage(data?.data ?? 'fi');
      return <I18nextProvider i18n={localization}>{children}</I18nextProvider>;
  }
}
