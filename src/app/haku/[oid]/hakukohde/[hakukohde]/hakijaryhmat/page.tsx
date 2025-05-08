'use client';
import { use } from 'react';

import { useTranslations } from '@/lib/localization/useTranslations';
import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakijaryhmat } from '@/lib/valintalaskenta/valintalaskenta-service';
import { isEmpty } from '@/lib/common';
import { HakijaryhmaContent } from './components/hakijaryhma-content';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { useHakijaryhmatSearchParams } from './hooks/useHakijaryhmatSearch';
import { HakijaryhmatControls } from './components/hakijaryhmat-controls';
import { NoResults } from '@/components/no-results';
import { FullClientSpinner } from '@/components/client-spinner';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const HakijaryhmatContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useHakijaryhmatSearchParams();

  const [hakijaryhmatQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakijaryhmat', hakuOid, hakukohdeOid],
        queryFn: () => getHakijaryhmat(hakuOid, hakukohdeOid),
      },
    ],
  });

  if (hakijaryhmatQuery.error) {
    throw hakijaryhmatQuery.error;
  }

  return isEmpty(hakijaryhmatQuery.data) ? (
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
          <HakijaryhmatControls />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {hakijaryhmatQuery.data.map((hakijaryhma) => (
        <HakijaryhmaContent hakijaryhma={hakijaryhma} key={hakijaryhma.oid} />
      ))}
    </Box>
  );
};

export default function HakijaryhmatPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HakijaryhmatContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
