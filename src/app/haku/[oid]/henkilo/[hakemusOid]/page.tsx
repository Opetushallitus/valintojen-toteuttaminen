'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import {
  buildLinkToApplication,
  getAtaruHakemukset,
  parseHakijaTiedot,
} from '@/app/lib/ataru';
import { Stack, Typography } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { filter, indexBy, map, pipe, prop, sortBy } from 'remeda';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { getHakemuksenLasketutValinnanvaiheet } from '@/app/lib/valintalaskenta-service';
import { selectValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getLatestSijoitteluajonTuloksetForHakemus } from '@/app/lib/valinta-tulos-service';
import { HakutoiveetTable } from './components/hakutoiveet-table';

const HenkiloContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, translateEntity } = useTranslations();

  const [
    { data: hakemukset },
    { data: hakemuksenValintalaskenta },
    { data: sijoittelunTuloksetByHakemus },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakemukset', hakuOid, hakemusOid],
        queryFn: () =>
          getAtaruHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
      },
      {
        queryKey: ['getHakemuksenValintalaskenta', hakuOid, hakemusOid],
        queryFn: () =>
          getHakemuksenLasketutValinnanvaiheet({ hakuOid, hakemusOid }),
      },
      {
        queryKey: [
          'getLatestSijoitteluajonTuloksetForHakemus',
          hakuOid,
          hakemusOid,
        ],
        queryFn: () =>
          getLatestSijoitteluajonTuloksetForHakemus({ hakuOid, hakemusOid }),
      },
    ],
  });

  const hakemus = hakemukset[0];

  if (!hakemus) {
    notFound();
  }

  const hakija = parseHakijaTiedot(hakemus);

  const hakukohdeOids = hakemus.hakutoiveet.map((h) => h.hakukohdeOid);
  const hakemuksetByOid = indexBy(hakemukset, prop('oid'));
  const lasketutValinnanVaiheet = hakemuksenValintalaskenta.hakukohteet.map(
    (hakukohde) => {
      return {
        ...hakukohde,
        valinnanvaiheet: selectValinnanvaiheet({
          hakemuksetByOid,
          lasketutValinnanVaiheet: hakukohde.valinnanvaihe,
          selectHakemusFields(hakemus) {
            return parseHakijaTiedot(hakemus);
          },
        }),
      };
    },
  );

  const { data: userPermissions } = useUserPermissions();

  const [{ data: hakukohteet }, { data: postitoimipaikka }] =
    useSuspenseQueries({
      queries: [
        {
          ...getHakukohteetQueryOptions(hakuOid, userPermissions),
          select: (hakukohteet: Array<Hakukohde>) =>
            pipe(
              hakukohteet,
              filter((h) => hakukohdeOids.includes(h.oid)),
              sortBy((h) => hakukohdeOids.indexOf(h.oid)),
              map((hakukohde) => ({
                ...hakukohde,
                ...lasketutValinnanVaiheet.find((v) => v.oid === hakukohde.oid),
                sijoittelunTulokset:
                  sijoittelunTuloksetByHakemus[hakukohde.oid],
              })),
            ),
        },
        {
          queryKey: ['getPostitoimipaikka', hakemus.postinumero],
          queryFn: () => getPostitoimipaikka(hakemus.postinumero),
        },
      ],
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
          value={`${hakemus.lahiosoite}, ${hakemus.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
      <HakutoiveetTable hakukohteet={hakukohteet} hakuOid={hakuOid} />
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
    <Stack spacing={2} sx={{ m: 4, width: '100%' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
