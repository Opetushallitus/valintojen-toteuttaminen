'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Divider, Stack, Typography } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import {
  LaskentaActorRef,
  LaskentaEventType,
  LaskentaState,
  useLaskentaError,
  useLaskentaState,
} from '@/lib/state/laskenta-state';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import useToaster from '@/hooks/useToaster';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Haku } from '@/lib/kouta/kouta-types';
import { ErrorAlert } from '@/components/error-alert';
import { useSelector } from '@xstate/react';
import { ProgressBar } from '@/components/progress-bar';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { getLaskentaStatusText } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { LaskentaStateButton } from '@/components/laskenta-state-button';

const LaskentaResult = ({ actorRef }: { actorRef: LaskentaActorRef }) => {
  const { t } = useTranslations();

  const laskentaError = useLaskentaError(actorRef);

  const state = useSelector(actorRef, (s) => s);
  const seurantaTiedot = useSelector(actorRef, (s) => s.context.seurantaTiedot);

  const laskentaPercent = seurantaTiedot
    ? Math.round(
        (100 *
          (seurantaTiedot?.hakukohteitaValmiina +
            seurantaTiedot?.hakukohteitaKeskeytetty)) /
          seurantaTiedot?.hakukohteitaYhteensa,
      )
    : 0;

  switch (true) {
    case state.matches({ [LaskentaState.IDLE]: LaskentaState.ERROR }):
      return (
        <ErrorAlert
          title={t('henkilo.valintalaskenta-epaonnistui')}
          message={laskentaError}
        />
      );
    case state.hasTag('started') || state.hasTag('completed'):
      return (
        <>
          <OphTypography variant="h4">
            {t('henkilo.valintalaskenta')}
          </OphTypography>
          <ProgressBar value={laskentaPercent} />
          <Typography>
            {getLaskentaStatusText(state, seurantaTiedot, t)}
            {seurantaTiedot &&
              `${t('henkilo.hakukohteita-valmiina')} ${seurantaTiedot.hakukohteitaValmiina}/${seurantaTiedot.hakukohteitaYhteensa}. ` +
                `${t('henkilo.suorittamattomia-hakukohteita')} ${seurantaTiedot?.hakukohteitaKeskeytetty ?? 0}.`}
          </Typography>
        </>
      );
    default:
      return null;
  }
};

export const HenkilonValintalaskenta = ({
  haku,
  haunAsetukset,
  hakukohteet,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
}) => {
  const { addToast } = useToaster();

  const [state, send, actorRef] = useLaskentaState({
    haku,
    haunAsetukset,
    hakukohteet,
    addToast,
  });

  return (
    <Stack spacing={2}>
      <ConfirmationModal
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={() => send({ type: LaskentaEventType.CONFIRM })}
        onCancel={() => send({ type: LaskentaEventType.CANCEL })}
      />
      <LaskentaResult actorRef={actorRef} />
      <LaskentaStateButton state={state} send={send} />
      {state.hasTag('completed') && (
        <SuorittamattomatHakukohteet
          actorRef={actorRef}
          hakukohteet={hakukohteet}
        />
      )}
      {(state.hasTag('started') || state.hasTag('completed')) && (
        <Divider sx={{ paddingTop: 1 }} />
      )}
    </Stack>
  );
};
