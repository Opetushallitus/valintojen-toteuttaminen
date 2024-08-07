'use client';

import { TabContainer } from '../tab-container';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { useHakeneetSearchResults } from '@/app/hooks/useHakeneetSearch';
import { HakeneetTable } from './hakeneet-table';
import HakeneetSearch from './hakeneet-search';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Haku } from '@/app/lib/types/kouta-types';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useHaku } from '@/app/hooks/useHaku';

type HakeneetParams = {
  haku: Haku;
  hakukohdeOid: string;
};

const HakeneetContent = ({ haku, hakukohdeOid }: HakeneetParams) => {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = useHakeneetSearchResults(haku.oid, hakukohdeOid);

  return (
    <>
      <HakeneetSearch />
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.maara"
      >
        <HakeneetTable
          setSort={setSort}
          sort={sort}
          hakeneet={pageResults}
          isKorkeakouluHaku={isKorkeakouluHaku(haku)}
        />
      </TablePaginationWrapper>
    </>
  );
};

export default function HakeneetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: haku } = useHaku({ hakuOid: params.oid });

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <HakeneetContent haku={haku} hakukohdeOid={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
