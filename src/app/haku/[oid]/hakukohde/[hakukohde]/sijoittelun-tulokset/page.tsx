'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { tryToGetLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isEmpty } from '@/lib/common';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { NoResults } from '@/components/no-results';
import { useSijoittelunTulosSearchParams } from './hooks/useSijoittelunTulosSearch';
import { SijoittelunTulosContent } from './components/sijoittelun-tulos-content';
import { SijoittelunTulosControls } from './components/sijoittelun-tulos-controls';
import { useHaku } from '@/lib/kouta/useHaku';
import { FullClientSpinner } from '@/components/client-spinner';
import { documentIdForHakukohdeQueryOptions } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

type SijoitteluContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const SijoitteluContent = ({
  hakuOid,
  hakukohdeOid,
}: SijoitteluContentParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useSijoittelunTulosSearchParams();

  const { data: haku } = useHaku({ hakuOid });
  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  const { data: tulokset } = useSuspenseQuery(
    tryToGetLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions({
      hakuOid,
      hakukohdeOid,
    }),
  );

  const kaikkiJonotHyvaksytty = Boolean(
    tulokset?.valintatapajonot.every((jono) => jono.accepted),
  );

  const { data: laskennattomatValinnanvaiheet } = useSuspenseQuery(
    valinnanvaiheetIlmanLaskentaaQueryOptions(hakukohde.oid),
  );

  return isEmpty(tulokset) ? (
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
          sijoitteluajoId={tulokset?.sijoitteluajoId}
        />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {tulokset?.valintatapajonot.map((jono) => {
        const isLaskennaton = Boolean(
          laskennattomatValinnanvaiheet?.find((v) =>
            v.jonot.find((j) => j.oid === jono.oid),
          ),
        );
        return (
          <SijoittelunTulosContent
            valintatapajono={jono}
            key={jono.oid}
            haku={haku}
            hakukohde={hakukohde}
            sijoitteluajoId={tulokset.sijoitteluajoId}
            lastModified={tulokset.lastModified}
            kaikkiJonotHyvaksytty={kaikkiJonotHyvaksytty}
            isLaskennaton={isLaskennaton}
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
    documentIdForHakukohdeQueryOptions({
      hakukohdeOid: params.hakukohde,
      documentType: 'osoitetarrat',
    }),
  );
  queryClient.prefetchQuery(
    documentIdForHakukohdeQueryOptions({
      hakukohdeOid: params.hakukohde,
      documentType: 'hyvaksymiskirjeet',
    }),
  );
  queryClient.prefetchQuery(
    documentIdForHakukohdeQueryOptions({
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
