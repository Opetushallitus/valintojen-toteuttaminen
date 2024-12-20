'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { Box, Divider, Stack, styled, Typography } from '@mui/material';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { HakutoiveetTable } from './components/hakutoiveet-table';
import { useHenkiloPageData } from './hooks/useHenkiloPageData';
import { use, useId, useState } from 'react';
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
import { ArrowRight } from '@mui/icons-material';
import { NDASH } from '@/app/lib/constants';
import { ErrorWithIcon } from '@/app/components/error-with-icon';
import { TFunction } from 'i18next';

const PROGRESSBAR_HEIGHT = '42px';
const TRANSITION_DURATION = '200ms';

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
          transition: `${TRANSITION_DURATION} width linear`,
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

const SimpleAccordion = ({
  titleOpen,
  titleClosed,
  children,
}: {
  titleOpen: React.ReactNode;
  titleClosed: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const accordionId = useId();
  const contentId = `SimpleAccordionContent_${accordionId}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '&.MuiButton-icon': {
          marginRight: 0.5,
        },
      }}
    >
      <OphButton
        variant="text"
        sx={{ fontWeight: 'normal', paddingX: 0 }}
        startIcon={
          <ArrowRight
            sx={{
              transform: isOpen ? 'rotate(90deg)' : 'none',
              transition: `${TRANSITION_DURATION} transform ease`,
              color: ophColors.black,
            }}
          />
        }
        onClick={() => setIsOpen((open) => !open)}
        aria-controls={contentId}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        {isOpen ? titleOpen : titleClosed}
      </OphButton>
      <Box
        id={contentId}
        sx={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: `${TRANSITION_DURATION} grid-template-rows ease`,
        }}
      >
        <Box sx={{ overflow: 'hidden' }}>{children}</Box>
      </Box>
    </Box>
  );
};

const SuorittamattomatHakukohteet = ({
  actorRef,
  hakukohteet,
}: {
  actorRef: LaskentaActorRef;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
}) => {
  const { t, translateEntity } = useTranslations();

  const summaryIlmoitus = useSelector(
    actorRef,
    (s) => s.context.summary?.ilmoitus,
  );

  const summaryErrors = useSelector(actorRef, (s) =>
    s.context.summary?.hakukohteet.filter((hk) => hk?.tila !== 'VALMIS'),
  );

  return summaryErrors ? (
    <SimpleAccordion
      titleOpen={t('henkilo.piilota-suorittamattomat-hakukohteet')}
      titleClosed={t('henkilo.nayta-suorittamattomat-hakukohteet')}
    >
      <Stack spacing={1} sx={{ paddingLeft: 3 }}>
        {summaryErrors?.map((e) => {
          const hakukohde = hakukohteet.find((hk) => hk.oid === e.hakukohdeOid);
          const ilmoitukset = e.ilmoitukset;
          return (
            <ErrorWithIcon key={e.hakukohdeOid}>
              <>
                <Typography>
                  {translateEntity(hakukohde?.jarjestyspaikkaHierarkiaNimi)}
                  {` ${NDASH} `}
                  {translateEntity(hakukohde?.nimi)} ({e.hakukohdeOid})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography component="span" variant="label">
                    {t('henkilo.syy')}:
                  </Typography>
                  <Box>
                    {(e.ilmoitukset?.length ?? 0) > 0 ? (
                      ilmoitukset?.map((ilmoitus) => (
                        <Typography
                          key={`${e.hakukohdeOid}_${ilmoitus.otsikko}`}
                        >
                          {ilmoitus?.otsikko}
                        </Typography>
                      ))
                    ) : (
                      <Typography>
                        {e.tila === 'TEKEMATTA' && summaryIlmoitus
                          ? summaryIlmoitus?.otsikko
                          : e.tila}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            </ErrorWithIcon>
          );
        })}
      </Stack>
    </SimpleAccordion>
  ) : null;
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
    case state.hasTag('started') || state.hasTag('completed'):
      return (
        <>
          <OphTypography variant="h4">
            {t('henkilo.valintalaskenta')}
          </OphTypography>
          <ProgressBar value={valmiinaProsentti} />
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
      <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
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
