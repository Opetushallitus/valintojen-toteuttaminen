'use client';
import { ophColors, OphSelect } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';
import { styled } from '@mui/material';

const WhiteSelect = styled(OphSelect)(() => ({
  backgroundColor: ophColors.white,
}));

export const LocalizedSelect = (
  props: React.ComponentProps<typeof OphSelect>,
) => {
  const { t } = useTranslations();
  return (
    <WhiteSelect
      inputProps={{ 'aria-label': t('yleinen.valitsevaihtoehto') }}
      placeholder={t('yleinen.valitse')}
      {...props}
    />
  );
};
