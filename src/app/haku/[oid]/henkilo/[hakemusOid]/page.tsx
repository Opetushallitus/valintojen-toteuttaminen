'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { Box, Stack, styled, Typography } from '@mui/material';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { HakutoiveetTable } from './components/hakutoiveet-table';
import { useHenkiloPageData } from './hooks/useHenkiloPageData';
import { use } from 'react';
import { HenkilonPistesyotto } from './components/henkilon-pistesyotto';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/app/lib/mui-utils';
import {
  LaskentaActorRef,
  LaskentaEvent,
  LaskentaEventType,
  LaskentaMachineSnapshot,
  LaskentaState,
  useLaskentaError,
  useLaskentaState,
} from '@/app/lib/state/laskenta-state';
import { HenkilonHakukohdeTuloksilla } from './lib/henkilo-page-types';
import useToaster from '@/app/hooks/useToaster';
import { useHaunAsetukset } from '@/app/hooks/useHaunAsetukset';
import { useHaku } from '@/app/hooks/useHaku';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { Haku } from '@/app/lib/types/kouta-types';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { ErrorAlert } from '@/app/components/error-alert';
import { useSelector } from '@xstate/react';
import { SeurantaTiedot } from '@/app/lib/types/laskenta-types';

const PROGRESSBAR_HEIGHT = '42px';

const ProgressBar = ({ value }: { value: number }) => {
  const valuePercent = `${value}%`;
  return (
    <Box
      role="progressbar"
      aria-valuenow={value}
      aria-valuetext={valuePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      sx={{
        position: 'relative',
        display: 'block',
        height: PROGRESSBAR_HEIGHT,
        border: `1px solid ${ophColors.grey300}`,
        maxWidth: '700px',
        borderRadius: '2px',
        '&:before, &:after': {
          position: 'absolute',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          content: `"${valuePercent}"`,
          height: '100%',
          lineHeight: PROGRESSBAR_HEIGHT,
          textIndent: (theme) => theme.spacing(2),
          userSelect: 'none',
        },
        '&:before': {
          backgroundColor: ophColors.white,
          color: ophColors.grey900,
          width: '100%',
        },
        '&:after': {
          backgroundColor: ophColors.cyan1,
          color: ophColors.white,
          width: valuePercent,
          transition: 'width 0.2s linear',
        },
      }}
    />
  );
};

const LaskentaButton = withDefaultProps(
  styled(OphButton)({
    alignSelf: 'flex-start',
  }),
  {
    variant: 'contained',
  },
);

const ConfirmationModalDialog = ({
  open,
  onAnswer,
}: {
  open: boolean;
  onAnswer: (answer: boolean) => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphModalDialog
      open={open}
      title={t('valinnanhallinta.varmista')}
      maxWidth="sm"
      actions={
        <>
          <OphButton
            variant="contained"
            onClick={() => {
              onAnswer(true);
            }}
          >
            {t('yleinen.kylla')}
          </OphButton>
          <OphButton
            variant="outlined"
            onClick={() => {
              onAnswer(false);
            }}
          >
            {t('yleinen.ei')}
          </OphButton>
        </>
      }
    />
  );
};

const LaskentaStateButton = ({
  state,
  send,
}: {
  state: LaskentaMachineSnapshot;
  send: (event: LaskentaEvent) => void;
}) => {
  const { t } = useTranslations();

  switch (true) {
    case state.hasTag('stopped') && !state.hasTag('finished'):
      return (
        <LaskentaButton
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
          variant="outlined"
          disabled={state.hasTag('canceling')}
          onClick={() => {
            send({ type: LaskentaEventType.CANCEL });
          }}
        >
          {t('henkilo.keskeyta-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('finished'):
      return (
        <LaskentaButton
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
  seurantaTiedot?: SeurantaTiedot | null,
) => {
  switch (true) {
    case state.hasTag('canceling'):
      return 'Keskeytetään laskentaa... ';
    case state.matches(LaskentaState.STARTING) ||
      (state.hasTag('started') && seurantaTiedot == null):
      return 'Käynnistetään laskentaa... ';
    case state.hasTag('started'):
      return seurantaTiedot?.jonosija
        ? `Tehtävä on laskennassa jonosijalla ${seurantaTiedot?.jonosija}. `
        : `Tehtävä on laskennassa parhaillaan. `;
    case state.hasTag('completed'):
      return 'Laskenta on päättynyt. ';
    default:
      return '';
  }
};

const LaskentaStateResult = ({ actorRef }: { actorRef: LaskentaActorRef }) => {
  const { t } = useTranslations();

  const laskentaError = useLaskentaError(actorRef);

  const state = useSelector(actorRef, (s) => s);

  const seurantaTiedot = state.context.seurantaTiedot;

  const valmiinaProsentti = seurantaTiedot
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
    case state.hasTag('started') || state.hasTag('finished'):
      return (
        <>
          <OphTypography variant="h4">
            {t('henkilo.valintalaskenta')}
          </OphTypography>
          <ProgressBar value={valmiinaProsentti} />
          <Typography>
            {getLaskentaStatusText(state, seurantaTiedot)}
            {seurantaTiedot &&
              `Hakukohteita valmiina ${seurantaTiedot.hakukohteitaValmiina}/${seurantaTiedot.hakukohteitaYhteensa}. `}
            {state.hasTag('finished') &&
              `Suorittamattomia hakukohteita ${seurantaTiedot?.hakukohteitaKeskeytetty ?? 0}.`}
          </Typography>
        </>
      );
    default:
      return null;
  }
};

const HenkilonValintalaskenta = ({
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
      <ConfirmationModalDialog
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onAnswer={(answer: boolean) => {
          if (answer) {
            send({ type: LaskentaEventType.CONFIRM });
          } else {
            send({ type: LaskentaEventType.CANCEL });
          }
        }}
      />
      <LaskentaStateResult actorRef={actorRef} />
      <LaskentaStateButton state={state} send={send} />
    </Stack>
  );
};

const HenkiloContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, translateEntity } = useTranslations();

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

  const { hakukohteet, hakija, postitoimipaikka } = useHenkiloPageData({
    hakuOid,
    hakemusOid,
  });

  return (
    <>
      <Typography variant="h2">{getHenkiloTitle(hakija)}</Typography>
      <HenkilonValintalaskenta
        hakukohteet={hakukohteet}
        haku={haku}
        haunAsetukset={haunAsetukset}
      />
      <Stack direction="row" spacing="4vw">
        <LabeledInfoItem
          label={t('henkilo.hakemus-oid')}
          value={
            <ExternalLink
              name={hakija.hakemusOid}
              href={buildLinkToApplication(hakija.hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('henkilo.lahiosoite')}
          value={`${hakija.lahiosoite}, ${hakija.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
      <HakutoiveetTable hakukohteet={hakukohteet} hakija={hakija} />
      <HenkilonPistesyotto hakija={hakija} hakukohteet={hakukohteet} />
    </>
  );
};

export default function HenkiloPage(props: {
  params: Promise<{ oid: string; hakemusOid: string }>;
}) {
  const params = use(props.params);
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  return (
    <Stack spacing={2} sx={{ margin: 4, width: '100%', overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
