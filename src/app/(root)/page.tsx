'use client';
import React from 'react';

import { useHakutavat } from '@/app/hooks/useHakutavat';
import { useHakuSearchResults } from '@/app/hooks/useHakuSearch';
import { HakuTablePaginationWrapper } from './haku-table-pagination-wrapper';
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

  const { data: hakutavat } = useHakutavat();

  return (
    <HakuTablePaginationWrapper
      totalCount={results?.length ?? 0}
      pageNumber={page}
      setPageNumber={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
    >
      <HakuTable
        haut={pageResults}
        hakutavat={hakutavat}
        setSort={setSort}
        sort={sort ?? ''}
      />
    </HakuTablePaginationWrapper>
  );
}
