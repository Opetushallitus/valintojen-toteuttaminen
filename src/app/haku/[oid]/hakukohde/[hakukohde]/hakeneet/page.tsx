'use client';

import { TabContainer } from '../TabContainer';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { useHakeneetSearchResults } from '@/app/hooks/useHakeneetSearch';
import { HakeneetTable } from './hakeneet-table';

export default function HakeneetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = useHakeneetSearchResults(params.oid, params.hakukohde);

  return (
    <TabContainer>
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.maara"
      >
        <HakeneetTable setSort={setSort} sort={sort} hakeneet={pageResults} />
      </TablePaginationWrapper>
    </TabContainer>
  );
}
