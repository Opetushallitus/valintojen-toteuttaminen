'use client';

import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getScoresForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '@/app/hooks/usePisteSyottoSearch';
import PisteSyottoSearch from './pistesyotto-search';

type PisteSyottoContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const PisteSyottoContent = ({
  hakuOid,
  hakukohdeOid,
}: PisteSyottoContentParams) => {
  const { data: pistetulokset } = useSuspenseQuery({
    queryKey: ['getScoresForHakukohde', hakukohdeOid],
    queryFn: () => getScoresForHakukohde(hakuOid, hakukohdeOid),
  });

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = usePisteSyottoSearchResults(pistetulokset);

  return (
    <>
      <PisteSyottoSearch />
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.maara"
      >
        <PisteSyottoTable
          setSort={setSort}
          sort={sort}
          pistetiedot={pageResults}
        />
      </TablePaginationWrapper>
    </>
  );
};

export default function PisteSyottoPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <PisteSyottoContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
