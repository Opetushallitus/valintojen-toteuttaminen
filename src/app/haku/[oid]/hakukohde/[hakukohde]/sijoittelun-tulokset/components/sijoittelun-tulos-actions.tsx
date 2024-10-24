import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, CircularProgress, styled } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { OphButton } from '@opetushallitus/oph-design-system';
import { SijoittelunTuloksetStates } from '../lib/sijoittelun-tulokset-state';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SijoittelunTuloksetActions = ({
  state,
  publishAllowed,
  publish,
}: {
  state: AnyMachineSnapshot;
  publishAllowed: boolean;
  publish: () => void;
}) => {
  const { t } = useTranslations();

  return (
    <ActionsContainer>
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
      <OphButton
        variant="contained"
        disabled={
          !publishAllowed || !state.matches(SijoittelunTuloksetStates.IDLE)
        }
        onClick={publish}
      >
        {t('sijoittelun-tulokset.hyvaksy')}
      </OphButton>
      {state.matches(SijoittelunTuloksetStates.PUBLISHING) && (
        <CircularProgress aria-label={t('yleinen.paivitetaan')} />
      )}
    </ActionsContainer>
  );
};
