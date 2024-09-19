import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, Button, CircularProgress } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { PisteSyottoStates } from '../lib/pistesyotto-state';

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
        columnGap: 2,
      }}
    >
      <Button
        type="submit"
        variant="contained"
        disabled={!state.matches(PisteSyottoStates.IDLE)}
      >
        {t('yleinen.tallenna')}
      </Button>
      {state.matches(PisteSyottoStates.UPDATING) && (
        <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
      )}
    </Box>
  );
};
