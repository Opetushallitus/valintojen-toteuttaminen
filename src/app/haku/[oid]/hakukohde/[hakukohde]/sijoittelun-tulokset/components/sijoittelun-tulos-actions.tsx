import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, CircularProgress } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { OphButton } from '@opetushallitus/oph-design-system';
import { SijoittelunTuloksetStates } from '../lib/sijoittelun-tulokset-state';

export const SijoittelunTuloksetActions = ({
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
      <OphButton
        type="submit"
        variant="contained"
        disabled={!state.matches(SijoittelunTuloksetStates.IDLE)}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      {state.matches(SijoittelunTuloksetStates.UPDATING) && (
        <CircularProgress aria-label={t('yleinen.paivitetaan')} />
      )}
    </Box>
  );
};
