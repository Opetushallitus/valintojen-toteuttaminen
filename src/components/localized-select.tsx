'use client';
import { OphSelect } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/lib/localization/useTranslations';

export const LocalizedSelect = ({
  ariaLabel,
  ...props
}: React.ComponentProps<typeof OphSelect> & { ariaLabel?: string }) => {
  const { t } = useTranslations();
  return (
    <OphSelect
      inputProps={{ 'aria-label': ariaLabel ?? t('yleinen.valitsevaihtoehto') }}
      MenuProps={{ id: 'select-menu' }}
      placeholder={t('yleinen.valitse')}
      {...props}
    />
  );
};
