import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, Button } from '@mui/material';
import theme from '@/app/theme';
import { AnyMachineSnapshot } from 'xstate';
import { PisteSyottoStates } from './pistesyotto-state';

export const PisteSyottoActions = ({
  state,
}: {
  state: AnyMachineSnapshot;
}) => {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: theme.spacing(2),
      }}
    >
      <Button
        type="submit"
        variant="contained"
        disabled={
          !state.matches(PisteSyottoStates.IDLE) ||
          state.context.changedPistetiedot.length < 1
        }
      >
        {t('yleinen.tallenna')}
      </Button>
    </Box>
  );
};
