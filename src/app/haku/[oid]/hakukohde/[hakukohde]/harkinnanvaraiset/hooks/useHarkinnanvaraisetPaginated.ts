import { useTranslations } from '@/lib/localization/useTranslations';
import { useMemo } from 'react';
import { byProp, getSortParts } from '@/components/table/table-utils';
import { useHarkinnanvaraisetSearchParams } from './useHarkinnanvaraisetSearchParams';
import { hakemusFilter } from '@/lib/filters';
import { HakemuksenHarkinnanvaraisuus } from '@/lib/types/harkinnanvaraiset-types';

export const useHarkinnanvaraisetPaginationQueryParams = () => {
  const { page, setPage, sort, setSort, pageSize, setPageSize } =
    useHarkinnanvaraisetSearchParams();
  return { page, setPage, sort, setSort, pageSize, setPageSize };
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
