import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';
import theme from '@/app/theme';

type CalculationConfirmParams = {
  confirm: () => void;
  cancel: () => void;
};

const CalculationConfirm = ({ confirm, cancel }: CalculationConfirmParams) => {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
      }}
    >
      <Box>{t('valinnanhallinta.varmista')}</Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: theme.spacing(1),
        }}
      >
        <Button variant="outlined" onClick={cancel}>
          {t('yleinen.peruuta')}
        </Button>
        <Button variant="contained" onClick={confirm}>
          {t('yleinen.ok')}
        </Button>
      </Box>
    </Box>
  );
};

export default CalculationConfirm;
