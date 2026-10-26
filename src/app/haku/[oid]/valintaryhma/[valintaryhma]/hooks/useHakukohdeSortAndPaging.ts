import { useMemo } from 'react';
import {
  byProp,
  getSortParts,
  SortDirection,
} from '@/components/table/table-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { HakukohdeWithLink } from '../components/valintaryhma-hakukohde-table';
import { usePaginationParams } from '@/hooks/usePaginationParams';

export const useHakukohdeSortAndPaging = (
  hakukohteet: Array<HakukohdeWithLink>,
) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    usePaginationParams();

  const results = useMemo(() => {
    const sortHakukohteet = (orderBy: string, direction: SortDirection) => {
      return hakukohteet.sort(byProp(orderBy, direction, translateEntity));
    };
    const { orderBy, direction } = getSortParts(sort);

    return orderBy && direction
      ? sortHakukohteet(orderBy, direction)
      : hakukohteet;
  }, [sort, translateEntity, hakukohteet]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, pageSize, page]);

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
