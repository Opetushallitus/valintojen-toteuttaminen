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
import { HakutoiveTitle } from './components/hakutoive-title';
import { KoeInputs } from '@/app/components/koe-inputs';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { NDASH } from '@/app/lib/constants';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { usePistesyottoState } from '@/app/lib/state/pistesyotto-state';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import useToaster from '@/app/hooks/useToaster';
import { useMemo, use } from 'react';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';

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
        return (
          <Box key={koe.tunniste} sx={{ paddingBottom: 2 }}>
            <KoeFields koe={koe} hakukohde={hakukohde} hakija={hakija} />
          </Box>
        );
      })}
    </>
  );
};

const KoeFields = ({
  hakija,
  koe,
  hakukohde,
}: {
  hakija: HakijaInfo;
  koe: ValintakoeAvaimet;
  hakukohde: HenkilonHakukohdeTuloksilla;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const matchingKoePisteet = hakukohde.pisteet?.find(
    (p) => p.tunniste === koe.tunniste,
  );

  const pistetiedot = useMemo(
    () => [
      {
        ...hakija,
        valintakokeenPisteet: matchingKoePisteet ? [matchingKoePisteet] : [],
      },
    ],
    [hakija, matchingKoePisteet],
  );

  const {
    actorRef: pistesyottoActorRef,
    isUpdating,
    isDirty,
    savePistetiedot,
  } = usePistesyottoState({
    hakuOid: hakukohde.hakuOid,
    hakukohdeOid: hakukohde.oid,
    pistetiedot,
    addToast,
  });

  useConfirmChangesBeforeNavigation(isDirty);

  const labelId = `${koe.tunniste}_label`;

  return (
    <>
      <Box sx={{ paddingLeft: 1, paddingBottom: 1 }}>
        <OphTypography variant="label" id={labelId}>
          {koe.kuvaus} <Range min={koe.min} max={koe.max} />
        </OphTypography>
      </Box>
      <Divider orientation="horizontal" />
      <Box
        component="section"
        sx={{
          display: 'flex',
          gap: 2,
          paddingLeft: 1,
          marginTop: 1.5,
          alignItems: 'flex-start',
        }}
        aria-labelledby={labelId}
      >
        <KoeInputs
          hakemusOid={hakija.hakemusOid}
          koe={koe}
          pistesyottoActorRef={pistesyottoActorRef}
        />
        <OphButton
          variant="contained"
          sx={{ minHeight: '48px' }}
          startIcon={isUpdating && <SpinnerIcon />}
          disabled={isUpdating}
          onClick={() => {
            savePistetiedot();
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
