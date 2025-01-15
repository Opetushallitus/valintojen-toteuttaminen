'use client';
import { OphSelect } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';

export const LocalizedSelect = (
  props: React.ComponentProps<typeof OphSelect>,
) => {
  const { t } = useTranslations();
  return (
    <OphSelect
      inputProps={{ 'aria-label': t('yleinen.valitsevaihtoehto') }}
      MenuProps={{ id: 'select-menu' }}
      placeholder={t('yleinen.valitse')}
      {...props}
    />
  );
};
