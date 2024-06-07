'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { TabContainer } from '../TabContainer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';

export default function HakeneetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', params.hakukohde],
    queryFn: () => getHakukohde(params.hakukohde),
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
  } = useHakeneetSearchResults();

  return (
    <TabContainer>
      <TablePaginationWrapper 
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={pageSize}
        setPageNumber={setPage}
        pageNumber={page}
      countTranslationKey="hakeneet.maara">

      </TablePaginationWrapper>
    </TabContainer>
  );
}
