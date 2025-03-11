'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import {
  LaskentaActorRef,
  LaskentaEvent,
  LaskentaEventType,
  LaskentaMachineSnapshot,
  LaskentaState,
  useLaskentaError,
} from '@/lib/state/laskenta-state';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { ErrorAlert } from '@/components/error-alert';
import { useSelector } from '@xstate/react';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { getLaskentaStatusText } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { LaskentaStateButton } from '@/components/laskenta-state-button';

const LaskentaResult = ({ actorRef }: { actorRef: LaskentaActorRef }) => {
  const { t } = useTranslations();

  const laskentaError = useLaskentaError(actorRef);

  const state = useSelector(actorRef, (s) => s);
  const seurantaTiedot = useSelector(actorRef, (s) => s.context.seurantaTiedot);

  switch (true) {
    case state.matches({ [LaskentaState.IDLE]: LaskentaState.ERROR }):
      return (
        <ErrorAlert
          title={t('valintalaskenta.valintalaskenta-epaonnistui')}
          message={laskentaError}
        />
      );
    case state.hasTag('started') || state.hasTag('completed'):
      return (
        <>
          <OphTypography variant="h4">
            {t('valintalaskenta.valintalaskenta')}
          </OphTypography>
          {state.matches(LaskentaState.PROCESSING) && (
            <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
          )}
          <Typography>
            {getLaskentaStatusText(state, seurantaTiedot, t)}
            {seurantaTiedot &&
              `${t('valintalaskenta.hakukohteita-valmiina')} ${seurantaTiedot.hakukohteitaValmiina}/${seurantaTiedot.hakukohteitaYhteensa}. ` +
                `${t('valintalaskenta.suorittamattomia-hakukohteita')} ${seurantaTiedot?.hakukohteitaKeskeytetty ?? 0}.`}
          </Typography>
        </>
      );
    default:
      return null;
  }
};

export const ValintaryhmanValintalaskenta = ({
  hakukohteet,
  actorRef,
  state,
  send,
}: {
  hakukohteet: Array<Hakukohde>;
  actorRef: LaskentaActorRef;
  state: LaskentaMachineSnapshot;
  send: (event: LaskentaEvent) => void;
}) => {
  const { t } = useTranslations();

  const summaryIlmoitus = useSelector(
    actorRef,
    (s) => s.context.summary?.ilmoitus,
  );

  return (
    <Stack spacing={2}>
      <ConfirmationModal
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={() => send({ type: LaskentaEventType.CONFIRM })}
        onCancel={() => send({ type: LaskentaEventType.CANCEL })}
      />
      <LaskentaResult actorRef={actorRef} />
      <LaskentaStateButton state={state} send={send} />
      {state.hasTag('completed') && summaryIlmoitus && (
        <ErrorAlert
          title={t('valinnanhallinta.virhe')}
          message={summaryIlmoitus.otsikko}
          hasAccordion={true}
        />
      )}
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
