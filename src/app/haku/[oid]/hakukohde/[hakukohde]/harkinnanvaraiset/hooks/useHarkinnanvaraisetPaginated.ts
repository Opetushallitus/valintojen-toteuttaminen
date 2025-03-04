import { useTranslations } from '@/app/lib/localization/useTranslations';
import { useMemo } from 'react';
import { byProp, getSortParts } from '@/app/components/table/table-utils';
import { parseAsInteger, useQueryState } from 'nuqs';
import { DEFAULT_NUQS_OPTIONS } from '@/app/lib/constants';
import { DEFAULT_PAGE_SIZE } from '@/app/lib/constants';
import { useHarkinnanvaraisetSearchParams } from './useHarkinnanvaraisetSearchParams';
import { hakemusFilter } from '@/app/lib/filters';
import { HakemuksenHarkinnanvaraisuus } from '@/app/lib/types/harkinnanvaraiset-types';

const usePaginationQueryParams = (paginationId: string) => {
  const [page, setPage] = useQueryState<number>(
    `page-${paginationId}`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [sort, setSort] = useQueryState(
    `sort-${paginationId}`,
    DEFAULT_NUQS_OPTIONS,
  );

  const [pageSize, setPageSize] = useQueryState(
    `page_size-${paginationId}`,
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  return {
    pageSize,
    setPageSize,
    page,
    setPage,
    sort,
    setSort,
  };
};

export const useHarkinnanvaraisetPaginationQueryParams = () => {
  return usePaginationQueryParams('harkinnanvaraiset');
};

export const useHarkinanvaraisetPaginated = (
  harkinnanvaraisetHakemukset: Array<HakemuksenHarkinnanvaraisuus>,
) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, sort, setSort, pageSize, setPageSize } =
    useHarkinnanvaraisetPaginationQueryParams();

  const { searchPhrase } = useHarkinnanvaraisetSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = harkinnanvaraisetHakemukset.filter((h) =>
      hakemusFilter(h, searchPhrase),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [harkinnanvaraisetHakemukset, searchPhrase, sort, translateEntity]);

  return {
    page,
    setPage,
    results,
    sort,
    setSort,
    pageSize,
    setPageSize,
  };
};
