'use client';
import { useMemo } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import {
  byProp,
  getSortParts,
  SortDirection,
} from '@/app/components/table/table-utils';
import { DEFAULT_NUQS_OPTIONS } from '@/app/lib/constants';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakukohdeWithLink } from '../components.tsx/valintaryhma-hakukohde-table';

const DEFAULT_PAGE_SIZE = 10;

export const useHakukohdeSortAndPagingParams = () => {
  const [page, setPage] = useQueryState<number>(
    `paget`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  const [sort, setSort] = useQueryState('sort', DEFAULT_NUQS_OPTIONS);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  };
};

export const useHakukohdeSortAndPaging = (hakukohteet: HakukohdeWithLink[]) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    useHakukohdeSortAndPagingParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const sortHakukohteet = (orderBy: string, direction: SortDirection) => {
      return hakukohteet.sort(byProp(orderBy, direction, translateEntity));
    };

    return orderBy && direction
      ? sortHakukohteet(orderBy, direction)
      : hakukohteet;
  }, [sort, translateEntity, hakukohteet]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageResults,
    results,
    sort,
    setSort,
  };
};
