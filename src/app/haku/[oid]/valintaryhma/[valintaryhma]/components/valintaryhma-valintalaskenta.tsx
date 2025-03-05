'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Divider, Stack, Typography } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/lib/mui-utils';
import {
  LaskentaActorRef,
  LaskentaEvent,
  LaskentaEventType,
  LaskentaMachineSnapshot,
  LaskentaState,
  useLaskentaError,
  useLaskentaState,
} from '@/lib/state/laskenta-state';
import useToaster from '@/hooks/useToaster';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { ErrorAlert } from '@/components/error-alert';
import { useSelector } from '@xstate/react';
import { SeurantaTiedot } from '@/lib/types/laskenta-types';
import { TFunction } from 'i18next';
import { ProgressBar } from '@/components/progress-bar';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { styled } from '@/lib/theme';

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

const getLaskentaStatusText = (
  state: LaskentaMachineSnapshot,
  seurantaTiedot: SeurantaTiedot | null,
  t: TFunction,
) => {
  switch (true) {
    case state.hasTag('canceling') ||
      (state.matches(LaskentaState.FETCHING_SUMMARY) &&
        state.context.seurantaTiedot?.tila === 'PERUUTETTU'):
      return `${t('henkilo.keskeytetaan-laskentaa')} `;
    case state.matches(LaskentaState.STARTING) ||
      (state.hasTag('started') && seurantaTiedot == null):
      return `${t('henkilo.kaynnistetaan-laskentaa')} `;
    case state.hasTag('started'):
      return seurantaTiedot?.jonosija
        ? `${'henkilo.tehtava-on-laskennassa-jonosijalla'} ${seurantaTiedot?.jonosija}. `
        : `${t('henkilo.tehtava-on-laskennassa-parhaillaan')}. `;
    case state.hasTag('completed'):
      return `${t('henkilo.laskenta-on-paattynyt')}. `;
    default:
      return '';
  }
};

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

export const ValintaryhmanValintalaskenta = ({
  haku,
  haunAsetukset,
  hakukohteet,
  valintaryhma,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Array<Hakukohde>;
  valintaryhma: ValintaryhmaHakukohteilla;
}) => {
  const { addToast } = useToaster();

  const [state, send, actorRef] = useLaskentaState({
    haku,
    valintaryhma,
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
      {/*       {state.hasTag('completed') && (
        <SuorittamattomatHakukohteet
          actorRef={actorRef}
          hakukohteet={hakukohteet}
        />
      )} */}
      {(state.hasTag('started') || state.hasTag('completed')) && (
        <Divider sx={{ paddingTop: 1 }} />
      )}
    </Stack>
  );
};
