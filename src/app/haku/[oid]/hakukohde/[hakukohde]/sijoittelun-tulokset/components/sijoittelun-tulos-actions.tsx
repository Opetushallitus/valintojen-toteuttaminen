import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, CircularProgress, styled } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { OphButton } from '@opetushallitus/oph-design-system';
import { SijoittelunTuloksetStates } from '../lib/sijoittelun-tulokset-state';
import useToaster from '@/app/hooks/useToaster';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { sendVastaanottopostiValintatapaJonolle } from '@/app/lib/valinta-tulos-service';
import { useIsHakuPublishAllowed } from '@/app/hooks/useIsHakuPublishAllowed';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SijoittelunTuloksetActions = ({
  haku,
  state,
  publish,
  hakukohde,
  valintatapajono,
}: {
  haku: Haku;
  state: AnyMachineSnapshot;
  publish: () => void;
  hakukohde: Hakukohde;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
}) => {
  const { t } = useTranslations();

  const isPublishAllowed = useIsHakuPublishAllowed({ haku });

  const { addToast } = useToaster();

  const sendVastaanottoposti = async () => {
    try {
      const data = await sendVastaanottopostiValintatapaJonolle(
        hakukohde.oid,
        valintatapajono.oid,
      );
      if (!data || data.length < 1) {
        addToast({
          key: 'vastaanottoposti-valintatapajono-empty',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-ei-lahetettavia',
          type: 'error',
        });
      } else {
        addToast({
          key: 'vastaanottoposti-valintatapajonos',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-lahetetty',
          type: 'success',
        });
      }
    } catch (e) {
      addToast({
        key: 'vastaanottoposti-valintatapajono-virhe',
        message:
          'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-virhe',
        type: 'error',
      });
      console.error(e);
    }
  };

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
          !isPublishAllowed || !state.matches(SijoittelunTuloksetStates.IDLE)
        }
        onClick={publish}
      >
        {t('sijoittelun-tulokset.hyvaksy')}
      </OphButton>
      {state.matches(SijoittelunTuloksetStates.PUBLISHING) && (
        <CircularProgress aria-label={t('yleinen.paivitetaan')} />
      )}
      <OphButton
        variant="contained"
        disabled={!state.matches(SijoittelunTuloksetStates.IDLE)}
        onClick={sendVastaanottoposti}
      >
        {t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti-jonolle')}
      </OphButton>
    </ActionsContainer>
  );
};
