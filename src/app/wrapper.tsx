'use client';
import { I18nextProvider } from 'react-i18next';
import { FullSpinner } from './components/full-spinner';
import { useAsiointiKieli } from './hooks/useAsiointiKieli';
import { createLocalizationProvider } from './lib/localization/localizations';

const LocalizationProvider = createLocalizationProvider();

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, error, data } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      LocalizationProvider.changeLanguage(data ?? 'fi');
      return (
        <I18nextProvider i18n={LocalizationProvider}>
          {children}
        </I18nextProvider>
      );
  }
}
