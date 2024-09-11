import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';
import theme from '@/app/theme';
import { Button } from '@opetushallitus/oph-design-system';
import { AnyEventObject, AnyMachineSnapshot } from 'xstate';
import { PisteSyottoEvents, PisteSyottoStates } from './pistesyotto-state';

export const PisteSyottoActions = ({
  state,
  send,
}: {
  state: AnyMachineSnapshot;
  send: (event: AnyEventObject) => void;
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
        variant="contained"
        disabled={
          !state.matches(PisteSyottoStates.IDLE) ||
          state.context.changedPistetiedot.length < 1
        }
        onClick={() => send({ type: PisteSyottoEvents.UPDATE })}
      >
        {t('yleinen.tallenna')}
      </Button>
    </Box>
  );
};
