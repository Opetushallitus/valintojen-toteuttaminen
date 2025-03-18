'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import {
  useHakeneetSearchParams,
  useHakeneetSearchResults,
} from '@/hooks/useHakeneetSearch';
import { HakeneetTable } from './components/hakeneet-table';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Haku } from '@/lib/kouta/kouta-types';
import { FullClientSpinner } from '@/components/client-spinner';
import { useHaku } from '@/lib/kouta/useHaku';
import { SearchInput } from '@/components/search-input';
import { NoResults } from '@/components/no-results';
import { isEmpty } from 'remeda';
import { useTranslations } from '@/lib/localization/useTranslations';

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

  const { searchPhrase, setSearchPhrase } = useHakeneetSearchParams();
  const { t } = useTranslations();

  return isEmpty(pageResults) ? (
    <NoResults text={t('hakeneet.ei-hakijoita')} />
  ) : (
    <>
      <SearchInput
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        name="hakeneet-search"
        sx={{ flexGrow: 4 }}
      />
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.hakija-maara"
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

export default function HakeneetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  const { data: haku } = useHaku({ hakuOid: params.oid });

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HakeneetContent haku={haku} hakukohdeOid={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
