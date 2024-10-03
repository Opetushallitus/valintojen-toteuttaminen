'use client';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box, CircularProgress } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getLatestSijoitteluAjonTuloksetWithValintaEsitys } from '@/app/lib/valinta-tulos-service';
import { isEmpty } from '@/app/lib/common';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { NoResults } from '@/app/components/no-results';
import { useSijoittelunTulosSearchParams } from './hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosContent } from './components/sijoittelun-tulos-content';
import { SijoittelunTulosControls } from './components/sijoittelun-tulos-controls';
import { useHaku } from '@/app/hooks/useHaku';
import { Haku } from '@/app/lib/types/kouta-types';

type SijoitteluContentParams = {
  haku: Haku;
  hakukohdeOid: string;
};

const SijoitteluContent = ({ haku, hakukohdeOid }: SijoitteluContentParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useSijoittelunTulosSearchParams();

  const [tuloksetQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          'getLatestSijoitteluAjonTuloksetWithValintaEsitys',
          haku.oid,
          hakukohdeOid,
        ],
        queryFn: () =>
          getLatestSijoitteluAjonTuloksetWithValintaEsitys(
            haku.oid,
            hakukohdeOid,
          ),
      },
    ],
  });

  if (tuloksetQuery.error) {
    throw tuloksetQuery.error;
  }

  return isEmpty(tuloksetQuery.data) ? (
    <NoResults text={t('hakijaryhmat.ei-tuloksia')} />
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <SijoittelunTulosControls haku={haku} />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {tuloksetQuery.data.valintatapajonot.map((jono) => (
        <SijoittelunTulosContent
          valintatapajono={jono}
          key={jono.oid}
          haku={haku}
        />
      ))}
    </Box>
  );
};

export default function SijoittelunTuloksetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { t } = useTranslations();

  const { data: haku } = useHaku({ hakuOid: params.oid });

  return (
    <TabContainer>
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <SijoitteluContent haku={haku} hakukohdeOid={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
