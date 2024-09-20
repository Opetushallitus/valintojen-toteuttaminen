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

  const [tuloksetQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          'getLatestSijoitteluAjonTuloksetWithValintaEsitys',
          hakuOid,
          hakukohdeOid,
        ],
        queryFn: () =>
          getLatestSijoitteluAjonTuloksetWithValintaEsitys(
            hakuOid,
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
        ></Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {tuloksetQuery.data.valintatapajonot.map((jono) => (
        <Box key={`jono-${jono.oid}`}>{jono.nimi}</Box>
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

  return (
    <TabContainer>
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <SijoitteluContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
