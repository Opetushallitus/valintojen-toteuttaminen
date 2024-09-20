'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import { THEME_OVERRIDES } from '../lib/theme';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { language } = useTranslations();
  return (
    <OphNextJsThemeProvider
      lang={language}
      variant="oph"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overrides={THEME_OVERRIDES as any}
    >
      {children}
    </OphNextJsThemeProvider>
  );
};
