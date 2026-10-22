import { useMemo } from 'react';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ValintakoeKutsuItem } from '@/lib/types/valintakoekutsut-types';
import { uncapitalize } from 'remeda';
import { DEFAULT_NUQS_OPTIONS, DEFAULT_PAGE_SIZE } from '@/lib/constants';

export const ryhmittelyParser = parseAsStringLiteral([
  'kokeittain',
  'hakijoittain',
]);

type Ryhmittely = 'kokeittain' | 'hakijoittain';

export const useValintakoekutsutGlobalSearchParams = () => {
  const [{ ryhmittely, vainKutsuttavat, pageSize }, setSearchParams] =
    useQueryStates(
      {
        ryhmittely: ryhmittelyParser.withDefault('kokeittain'),
        vainKutsuttavat: parseAsBoolean.withDefault(true),
        pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      },
      {
        ...DEFAULT_NUQS_OPTIONS,
        urlKeys: {
          vainKutsuttavat: 'vain-kutsuttavat',
          pageSize: 'page_size',
        },
      },
    );

  return {
    ryhmittely,
    setRyhmittely: (value: Ryhmittely | null) =>
      setSearchParams({ ryhmittely: value }),
    vainKutsuttavat,
    setVainKutsuttavat: (value: boolean) =>
      setSearchParams({ vainKutsuttavat: value }),
    pageSize,
    setPageSize: (value: number) => setSearchParams({ pageSize: value }),
  };
};

export const useValintakoekutsutSearchParams = (valintakoeTunniste: string) => {
  const [{ page, sort }, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      sort: parseAsString.withDefault(''),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        page: `page-${valintakoeTunniste}`,
        sort: `sort-${valintakoeTunniste}`,
      },
    },
  );

  return {
    page,
    setPage: (value: number) => setSearchParams({ page: value }),
    sort,
    setSort: (value: string) => setSearchParams({ sort: value }),
  };
};

export const makePaginationId = (value: string) => {
  return uncapitalize(
    value
      .replace(/[\s-]+/g, '-')
      .replace(/[,.:]/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''),
  );
};

export const useValintakoekutsutPaginated = <
  T extends Pick<
    ValintakoeKutsuItem,
    'hakemusOid' | 'hakijaOid' | 'hakijanNimi'
  >,
>(
  paginationPrefix: string,
  valintakoeKutsut: Array<T>,
) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, sort, setSort } = useValintakoekutsutSearchParams(
    makePaginationId(paginationPrefix),
  );

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

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    sort,
    setSort,
    vainKutsuttavat,
    setVainKutsuttavat,
    ryhmittely,
    setRyhmittely,
  };
};
