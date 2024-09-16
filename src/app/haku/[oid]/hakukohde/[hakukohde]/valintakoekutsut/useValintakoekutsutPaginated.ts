'use client';
import { useMemo } from 'react';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';
import { byProp, getSortParts } from '@/app/components/table/table-utils';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintakoeKutsuItem } from '@/app/hooks/useValintakoekutsut';

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;

export const ryhmittelyParser = parseAsStringLiteral([
  'kokeittain',
  'hakijoittain',
]);

export const useValintakoekutsutGlobalSearchParams = () => {
  const [ryhmittely, setRyhmittely] = useQueryState(
    'ryhmittely',
    ryhmittelyParser
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault('kokeittain'),
  );

  const [vainKutsuttavat, setVainKutsuttavat] = useQueryState(
    'vain-kutsuttavat',
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(true),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  return {
    ryhmittely,
    setRyhmittely,
    vainKutsuttavat,
    setVainKutsuttavat,
    pageSize,
    setPageSize,
  };
};

export const useValintakoekutsutSearchParams = (valintakoeTunniste: string) => {
  const [page, setPage] = useQueryState<number>(
    `page-${valintakoeTunniste}`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [sort, setSort] = useQueryState(
    `sort-${valintakoeTunniste}`,
    DEFAULT_NUQS_OPTIONS,
  );

  return {
    page,
    setPage,
    sort,
    setSort,
  };
};

export const useValintakoekutsutPaginated = (
  valintakoeTunniste: string,
  valintakoeKutsut: Array<ValintakoeKutsuItem>,
) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, sort, setSort } =
    useValintakoekutsutSearchParams(valintakoeTunniste);

  const {
    vainKutsuttavat,
    setVainKutsuttavat,
    ryhmittely,
    setRyhmittely,
    pageSize,
    setPageSize,
  } = useValintakoekutsutGlobalSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);
    return orderBy && direction
      ? valintakoeKutsut.sort(byProp(orderBy, direction, translateEntity))
      : valintakoeKutsut;
  }, [valintakoeKutsut, sort, translateEntity]);

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
    vainKutsuttavat,
    setVainKutsuttavat,
    ryhmittely,
    setRyhmittely,
  };
};
