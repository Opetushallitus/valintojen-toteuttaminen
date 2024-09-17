import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

type ConfirmParams = {
  confirm: () => void;
  cancel: () => void;
};

const Confirm = ({ confirm, cancel }: ConfirmParams) => {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 1,
      }}
    >
      <Box>{t('valinnanhallinta.varmista')}</Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 1,
        }}
      >
        <OphButton variant="outlined" onClick={cancel}>
          {t('yleinen.peruuta')}
        </OphButton>
        <OphButton variant="contained" onClick={confirm}>
          {t('yleinen.ok')}
        </OphButton>
      </Box>
    </Box>
  );
};

export default Confirm;
