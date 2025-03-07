'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/lib/mui-utils';
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
import { styled } from '@/lib/theme';
import { getLaskentaStatusText } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';

const LaskentaButton = withDefaultProps(
  styled(OphButton)({
    alignSelf: 'flex-start',
  }),
  {
    variant: 'contained',
  },
);

const LaskentaStateButton = ({
  state,
  send,
}: {
  state: LaskentaMachineSnapshot;
  send: (event: LaskentaEvent) => void;
}) => {
  const { t } = useTranslations();

  switch (true) {
    case state.hasTag('stopped') && !state.hasTag('completed'):
      return (
        <LaskentaButton
          key="suorita"
          onClick={() => {
            send({ type: LaskentaEventType.START });
          }}
        >
          {t('henkilo.suorita-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('started'):
      return (
        <LaskentaButton
          key="keskeyta"
          variant="outlined"
          disabled={state.hasTag('canceling')}
          onClick={() => {
            send({ type: LaskentaEventType.CANCEL });
          }}
        >
          {t('henkilo.keskeyta-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('completed'):
      return (
        <LaskentaButton
          key="sulje"
          variant="outlined"
          onClick={() => {
            send({ type: LaskentaEventType.RESET_RESULTS });
          }}
        >
          {t('henkilo.sulje-laskennan-tiedot')}
        </LaskentaButton>
      );
    default:
      return null;
  }
};

const LaskentaResult = ({ actorRef }: { actorRef: LaskentaActorRef }) => {
  const { t } = useTranslations();

  const laskentaError = useLaskentaError(actorRef);

  const state = useSelector(actorRef, (s) => s);
  const seurantaTiedot = useSelector(actorRef, (s) => s.context.seurantaTiedot);

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
          {state.matches(LaskentaState.PROCESSING) && (
            <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
          )}
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
