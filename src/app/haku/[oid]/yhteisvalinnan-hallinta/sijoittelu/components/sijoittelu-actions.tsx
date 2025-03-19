import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SijoitteluActions = () => {
  const { t } = useTranslations();

  return (
    <ActionsContainer>
      <OphButton
        onClick={() => {}}
        variant="contained"
        loading={false}
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.sijoittelu.suorita')}
      </OphButton>
      <OphButton
        onClick={() => {}}
        variant="outlined"
        loading={false}
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.sijoittelu.vie-tulokset')}
      </OphButton>
      <OphButton
        onClick={() => {}}
        variant="outlined"
        loading={false}
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.sijoittelu.vie-tarrat')}
      </OphButton>
      <OphButton
        onClick={() => {}}
        variant="outlined"
        loading={false}
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.sijoittelu.vie-kirjeiksi')}
      </OphButton>
    </ActionsContainer>
  );
};
