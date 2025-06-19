'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { isEmpty } from '@/lib/common';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { NoResults } from '@/components/no-results';
import { useSijoittelunTulosSearchParams } from './hooks/useSijoittelunTulosSearch';
import { SijoittelunTulosContent } from './components/sijoittelun-tulos-content';
import { SijoittelunTulosControls } from './components/sijoittelun-tulos-controls';
import { FullClientSpinner } from '@/components/client-spinner';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { useSijoitteluajonTuloksetValintatiedoilla } from '@/lib/valinta-tulos-service/useSijoitteluajonTuloksetValintatiedoilla';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { queryOptionsGetLatestSijoitteluajonTuloksetWithValintaEsitys } from '@/lib/valinta-tulos-service/valinta-tulos-queries';
import {
  queryOptionsGetHakukohde,
  queryOptionsGetHaku,
} from '@/lib/kouta/kouta-queries';
import { queryOptionsGetHakukohteenValinnanvaiheet } from '@/lib/valintaperusteet/valintaperusteet-queries';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';
import { queryOptionsGetDocumentIdForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';

const SijoitteluContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useSijoittelunTulosSearchParams();

  const [
    { data: haku },
    { data: hakukohde },
    { data: sijoittelunTulokset },
    { data: valinnanvaiheet },
    { data: hakemukset },
  ] = useSuspenseQueries({
    queries: [
      queryOptionsGetHaku({ hakuOid }),
      queryOptionsGetHakukohde({ hakukohdeOid }),
      queryOptionsGetLatestSijoitteluajonTuloksetWithValintaEsitys({
        hakuOid,
        hakukohdeOid,
      }),
      queryOptionsGetHakukohteenValinnanvaiheet(hakukohdeOid),
      queryOptionsGetHakemukset({
        hakuOid,
        hakukohdeOid,
      }),
    ],
  });

  const tuloksetValintatiedoilla = useSijoitteluajonTuloksetValintatiedoilla({
    hakemukset,
    sijoittelunTulokset,
  });

  const kaikkiJonotHyvaksytty = Boolean(
    tuloksetValintatiedoilla?.valintatapajonot.every((jono) => jono.accepted),
  );

  return isEmpty(tuloksetValintatiedoilla?.valintatapajonot) ? (
    <NoResults text={t('sijoittelun-tulokset.ei-tuloksia')} />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          gap: 2,
        }}
      >
        <SijoittelunTulosControls
          haku={haku}
          hakukohde={hakukohde}
          sijoitteluajoId={tuloksetValintatiedoilla?.sijoitteluajoId}
        />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {tuloksetValintatiedoilla?.valintatapajonot.map((jono) => {
        const kayttaaLaskentaa = checkIsValintalaskentaUsed(
          valinnanvaiheet,
          jono.oid,
        );

        return (
          <SijoittelunTulosContent
            valintatapajono={jono}
            key={jono.oid}
            haku={haku}
            hakukohde={hakukohde}
            sijoitteluajoId={tuloksetValintatiedoilla.sijoitteluajoId}
            lastModified={tuloksetValintatiedoilla.lastModified}
            kaikkiJonotHyvaksytty={kaikkiJonotHyvaksytty}
            kayttaaLaskentaa={kayttaaLaskentaa}
          />
        );
      })}
    </Box>
  );
};

export default function SijoittelunTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);

  const queryClient = useQueryClient();
  queryClient.prefetchQuery(
    queryOptionsGetDocumentIdForHakukohde({
      hakukohdeOid: params.hakukohde,
      documentType: 'osoitetarrat',
    }),
  );
  queryClient.prefetchQuery(
    queryOptionsGetDocumentIdForHakukohde({
      hakukohdeOid: params.hakukohde,
      documentType: 'hyvaksymiskirjeet',
    }),
  );
  queryClient.prefetchQuery(
    queryOptionsGetDocumentIdForHakukohde({
      hakukohdeOid: params.hakukohde,
      documentType: 'sijoitteluntulokset',
    }),
  );

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <SijoitteluContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
