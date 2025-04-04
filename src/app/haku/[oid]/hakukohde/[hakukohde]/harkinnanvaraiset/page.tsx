'use client';
import { use } from 'react';

import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/components/client-spinner';
import { Stack } from '@mui/material';
import { useHarkinnanvaraisetHakemukset } from './hooks/useHarkinnanvaraisetHakemukset';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { useHarkinnanvaraisetPaginationQueryParams } from './hooks/useHarkinnanvaraisetPaginated';
import { HarkinnanvaraisetForm } from './components/harkinnanvaraiset-form';
import { HarkinnanvaraisetSearchInput } from './components/harkinnanvaraiset-search-input';
import { NoResults } from '@/components/no-results';
import { isEmpty } from 'remeda';
import { useTranslations } from '@/lib/localization/useTranslations';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const HarkinnanvaraisetContent = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
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

export default function HarkinnanvaraisetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
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
