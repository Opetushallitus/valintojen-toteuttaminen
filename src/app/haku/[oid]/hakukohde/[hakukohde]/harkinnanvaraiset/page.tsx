'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { Stack } from '@mui/material';
import { useHarkinnanvaraisetHakemukset } from './hooks/useHakinnanvaraisetHakemukset';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { useHarkinnanvaraisetPaginationQueryParams } from './hooks/useHarkinnanvaraisetPaginated';
import { HarkinnanvaraisetForm } from './components/harkinnanvaraiset-form';
import { HarkinnanvaraisetSearchInput } from './components/harkinnanvaraiset-search-input';
import { NoResults } from '@/app/components/no-results';
import { isEmpty } from 'remeda';
import { useTranslations } from '@/app/hooks/useTranslations';

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
  const { t } = useTranslations();

  return isEmpty(harkinnanvaraisetHakemukset) ? (
    <NoResults text={t('harkinnanvaraiset.ei-harkinnanvaraisia-hakemuksia')} />
  ) : (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <HarkinnanvaraisetSearchInput />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Stack>
      <HarkinnanvaraisetForm
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        harkinnanvaraisetHakemukset={harkinnanvaraisetHakemukset}
      />
    </Stack>
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
