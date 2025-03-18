'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import { THEME_OVERRIDES } from '@/lib/theme';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getLanguage } = useTranslations();
  return (
    <OphNextJsThemeProvider
      lang={getLanguage()}
      variant="oph"
      overrides={THEME_OVERRIDES}
    >
      {children}
    </OphNextJsThemeProvider>
  );
};
