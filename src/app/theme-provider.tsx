'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import { THEME_OVERRIDES } from './theme';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useTranslations();
  return (
    <OphNextJsThemeProvider
      lang={language}
      variant="oph"
      overrides={THEME_OVERRIDES}
    >
      {children}
    </OphNextJsThemeProvider>
  );
};
