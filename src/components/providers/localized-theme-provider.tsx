import { useTranslations } from '@/lib/localization/useTranslations';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { THEME_OVERRIDES } from '@/lib/theme';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getLanguage } = useTranslations();
  return (
    <OphThemeProvider
      lang={getLanguage()}
      variant="oph"
      overrides={THEME_OVERRIDES}
    >
      {children}
    </OphThemeProvider>
  );
};
