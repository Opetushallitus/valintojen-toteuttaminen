'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import { THEME_OVERRIDES } from '@/lib/theme';
import { OphLanguage } from '@opetushallitus/oph-design-system';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getLanguage } = useTranslations();
  return (
    <OphNextJsThemeProvider
      lang={getLanguage() as OphLanguage}
      variant="oph"
      overrides={THEME_OVERRIDES}
    >
      {children}
    </OphNextJsThemeProvider>
  );
};
