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
import { useCallback } from 'react';
import { NDASH } from '@/app/lib/constants';
import { OphButton } from '@opetushallitus/oph-design-system';

const Range = ({
  min,
  max,
}: {
  min?: number | string;
  max?: number | string;
}) => (min || max ? `${min ?? ''}${NDASH}${max ?? ''}` : '');

const KoeFields = ({
  hakemusOid,
  koe,
  pisteet,
}: {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  pisteet?: ValintakokeenPisteet;
}) => {
  const { t } = useTranslations();
  const updateForm = useCallback(() => {}, []);
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
          hakemusOid={hakemusOid}
          koe={koe}
          koePisteet={pisteet}
          updateForm={updateForm}
          disabled={false}
        />
        <OphButton variant="contained" onClick={() => {}}>
          {t('yleinen.tallenna')}
        </OphButton>
      </Box>
    </>
  );
};

const Pistesyotto = ({
  hakemusOid,
  hakukohteet,
}: {
  hakemusOid: string;
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
        const { pisteet } = hakukohde;
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
                    hakemusOid={hakemusOid}
                    koe={koe}
                    pisteet={matchingKoePisteet}
                  />
                </Box>
              );
            })}
          </>
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
      <Pistesyotto hakemusOid={hakemusOid} hakukohteet={hakukohteet} />
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
