'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { HakutoiveetTable } from './components/hakutoiveet-table';
import { useHenkiloPageData } from './hooks/useHenkiloPageData';
import { HenkilonHakukohdeTuloksilla } from './lib/henkilo-page-types';
import { isEmpty } from 'remeda';
import { ValintakokeenPisteet } from '@/app/lib/types/laskenta-types';
import { HakutoiveTitle } from './components/hakutoive-title';
import { KoeCell } from '@/app/haku/[oid]/hakukohde/[hakukohde]/pistesyotto/components/koe-cell';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { NDASH } from '@/app/lib/constants';
import { OphButton } from '@opetushallitus/oph-design-system';
import {
  PistesyottoChangedPistetietoEvent,
  PisteSyottoEvent,
  PistesyottoSaveEvent,
  PisteSyottoStates,
  usePistesyottoMachine,
} from '@/app/haku/[oid]/hakukohde/[hakukohde]/pistesyotto/lib/pistesyotto-state';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { useMachine } from '@xstate/react';
import useToaster from '@/app/hooks/useToaster';
import { ChangePisteSyottoFormParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/pistesyotto/components/pistesyotto-form';
import { useMemo } from 'react';
import { SpinnerIcon } from '@/app/components/spinner-icon';

const Range = ({
  min,
  max,
}: {
  min?: number | string;
  max?: number | string;
}) => (min || max ? `${min ?? ''}${NDASH}${max ?? ''}` : '');

const HakukohdeFields = ({
  hakija,
  hakukohde,
}: {
  hakija: HakijaInfo;
  hakukohde: HenkilonHakukohdeTuloksilla;
}) => {
  const { addToast } = useToaster();

  const { pisteet } = hakukohde;

  const pistetiedot = useMemo(
    () => [
      {
        ...hakija,
        valintakokeenPisteet: hakukohde.pisteet!,
      },
    ],
    [hakija, hakukohde.pisteet],
  );

  const pistesyottoMachine = usePistesyottoMachine({
    hakuOid: hakukohde.hakuOid,
    hakukohdeOid: hakukohde.oid,
    pistetiedot,
    addToast,
  });

  const [state, send] = useMachine(pistesyottoMachine);

  return (
    <>
      <Typography
        variant="h4"
        component="h3"
        sx={{ paddingLeft: 1, paddingY: 2 }}
      >
        <HakutoiveTitle
          hakutoiveNumero={hakukohde.hakutoiveNumero}
          hakukohde={hakukohde}
        />
      </Typography>
      {hakukohde.kokeet?.map((koe) => {
        const matchingKoePisteet = pisteet?.find(
          (p) => p.tunniste === koe.tunniste,
        );
        return (
          <Box key={koe.tunniste}>
            <KoeFields
              koe={koe}
              hakija={hakija}
              pisteet={matchingKoePisteet}
              send={send}
              isPending={state.matches(PisteSyottoStates.UPDATING)}
            />
          </Box>
        );
      })}
    </>
  );
};

const KoeFields = ({
  hakija,
  koe,
  pisteet,
  send,
  isPending,
}: {
  hakija: HakijaInfo;
  koe: ValintakoeAvaimet;
  pisteet?: ValintakokeenPisteet;
  send: (e: PistesyottoSaveEvent | PistesyottoChangedPistetietoEvent) => void;
  isPending: boolean;
}) => {
  const { t } = useTranslations();

  const updateForm = (changeParams: ChangePisteSyottoFormParams) => {
    send({
      type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
      ...changeParams,
    });
  };

  return (
    <>
      <Box sx={{ paddingLeft: 1, paddingBottom: 1 }}>
        <Typography variant="label">
          {koe.kuvaus} <Range min={koe.min} max={koe.max} />
        </Typography>
      </Box>
      <Divider orientation="horizontal" />
      <Box sx={{ display: 'flex', gap: 2, paddingLeft: 1, marginTop: 1.5 }}>
        <KoeCell
          hakemusOid={hakija.hakemusOid}
          koe={koe}
          koePisteet={pisteet}
          updateForm={updateForm}
          disabled={false}
        />
        <OphButton
          variant="contained"
          startIcon={isPending && <SpinnerIcon />}
          disabled={isPending}
          onClick={() => {
            send({
              type: PisteSyottoEvent.SAVE,
            });
          }}
        >
          {t('yleinen.tallenna')}
        </OphButton>
      </Box>
    </>
  );
};

const Pistesyotto = ({
  hakija,
  hakukohteet,
}: {
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
}) => {
  const { t } = useTranslations();
  const hakukohteetKokeilla = hakukohteet?.filter(
    (hakukohde) => !isEmpty(hakukohde.kokeet ?? []),
  );

  return isEmpty(hakukohteetKokeilla) ? null : (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h3">{t('henkilo.pistesyotto')}</Typography>

      {hakukohteetKokeilla.map((hakukohde) => {
        return (
          <HakukohdeFields
            key={hakukohde.oid}
            hakija={hakija}
            hakukohde={hakukohde}
          />
        );
      })}
    </Box>
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

  const { hakukohteet, hakija, postitoimipaikka } = useHenkiloPageData({
    hakuOid,
    hakemusOid,
  });

  return (
    <>
      <Typography variant="h2">{getHenkiloTitle(hakija)}</Typography>
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
      <Pistesyotto hakija={hakija} hakukohteet={hakukohteet} />
    </>
  );
};

export default function HenkiloPage({
  params,
}: {
  params: { oid: string; hakemusOid: string };
}) {
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  return (
    <Stack spacing={2} sx={{ m: 4, width: '100%', overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
