'use client';

import { TabContainer } from '../TabContainer';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { useHakeneetSearchResults } from '@/app/hooks/useHakeneetSearch';
import { HakeneetTable } from './hakeneet-table';
import HakeneetSearch from './hakeneet-search';
import { getHaku, isKorkeakouluHaku } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Haku } from '@/app/lib/kouta-types';

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
  const { t } = useTranslations();

  const { data: haku } = useSuspenseQuery({
    queryKey: ['getHaku', params.oid],
    queryFn: () => getHaku(params.oid),
  });

  return (
    <TabContainer>
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <HakeneetContent haku={haku} hakukohdeOid={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
