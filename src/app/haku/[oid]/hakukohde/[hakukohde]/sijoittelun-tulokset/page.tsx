'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tryToGetLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions } from '@/app/lib/valinta-tulos-service/valinta-tulos-service';
import { isEmpty } from '@/app/lib/common';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { NoResults } from '@/app/components/no-results';
import { useSijoittelunTulosSearchParams } from './hooks/useSijoittelunTulosSearch';
import { SijoittelunTulosContent } from './components/sijoittelun-tulos-content';
import { SijoittelunTulosControls } from './components/sijoittelun-tulos-controls';
import { useHaku } from '@/app/hooks/useHaku';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { useHakukohde } from '@/app/hooks/useHakukohde';

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
      {tulokset?.valintatapajonot.map((jono) => (
        <SijoittelunTulosContent
          valintatapajono={jono}
          key={jono.oid}
          haku={haku}
          hakukohde={hakukohde}
          sijoitteluajoId={tulokset.sijoitteluajoId}
          lastModified={tulokset.lastModified}
        />
      ))}
    </Box>
  );
};

export default function SijoittelunTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);

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
