'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { Box } from '@mui/material';
import { useHarkinnanvaraisetHakemukset } from './hooks/useHakinnanvaraisetHakemukset';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { useHarkinnanvaraisetPaginationQueryParams } from './hooks/useHarkinnanvaraisetPaginated';
import { HarkinnanvaraisetForm } from './components/harkinnanvaraiset-form';
import { HarkinnanvaraisetSearchInput } from './components/harkinnanvaraiset-search-input';

const HarkinnanvaraisetContent = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const harkinnanvaraisetHakemukset = useHarkinnanvaraisetHakemukset({
    hakuOid,
    hakukohdeOid,
  });

  const { pageSize, setPageSize } = useHarkinnanvaraisetPaginationQueryParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <HarkinnanvaraisetSearchInput />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <HarkinnanvaraisetForm
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        harkinnanvaraisetHakemukset={harkinnanvaraisetHakemukset}
      />
    </Box>
  );
};

export default function HarkinnanvaraisetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HarkinnanvaraisetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
