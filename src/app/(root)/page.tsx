'use client';
import { useHakuSearchResults } from '@/app/hooks/useHakuSearch';
import { TablePaginationWrapper } from '../components/table/table-pagination-wrapper';
import { HakuTable } from './haku-table';

export const dynamic = 'force-dynamic';

export default function Home() {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = useHakuSearchResults();

  return (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      pageNumber={page}
      setPageNumber={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      countTranslationKey="haku.maara"
    >
      <HakuTable haut={pageResults} setSort={setSort} sort={sort ?? ''} />
    </TablePaginationWrapper>
  );
}
