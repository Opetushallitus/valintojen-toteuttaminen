import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';
import { useTranslations } from '@/lib/localization/useTranslations';
import { hakemusFilter } from '@/lib/filters';
import { isEmpty } from 'remeda';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';

export const useValinnanTuloksetSearchParams = () => {
  const [{ searchPhrase, valinnanTila, vastaanottoTila }, setSearchParams] =
    useQueryStates(
      {
        searchPhrase: parseAsString.withDefault(''),
        valinnanTila: parseAsString.withDefault(''),
        vastaanottoTila: parseAsString.withDefault(''),
      },
      {
        ...DEFAULT_NUQS_OPTIONS,
        urlKeys: {
          searchPhrase: 'search',
          valinnanTila: 'valinnantila',
          vastaanottoTila: 'vastaanottotila',
        },
      },
    );

  const paginationParams = usePaginationParams();

  const resetPages = useResetPages();

  const setSearchParamsAndResetPages = (
    values: Parameters<typeof setSearchParams>[0],
  ) => {
    setSearchParams(values);
    resetPages();
  };

  const setSearchDebounce = useDebounce(
    (value: string) => setSearchParamsAndResetPages({ searchPhrase: value }),
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    ...paginationParams,
    valinnanTila,
    setValinnanTila: (value: string) =>
      setSearchParamsAndResetPages({ valinnanTila: value }),
    vastaanottoTila,
    setVastaanottoTila: (value: string) =>
      setSearchParamsAndResetPages({ vastaanottoTila: value }),
  };
};

export const useValinnanTuloksetSearch = (
  hakemukset: Array<HakemuksenValinnanTulos>,
) => {
  const { translateEntity } = useTranslations();

  const {
    valinnanTila,
    vastaanottoTila,
    searchPhrase,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  } = useValinnanTuloksetSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakemukset.filter(
      (hakemus) =>
        (isEmpty(valinnanTila) || valinnanTila === hakemus?.valinnanTila) &&
        (isEmpty(vastaanottoTila) ||
          vastaanottoTila === hakemus?.vastaanottoTila) &&
        hakemusFilter(hakemus, searchPhrase),
    );

    if (orderBy === 'valinnantila') {
      return sortByValinnanTila(direction, filtered);
    }

    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [
    hakemukset,
    searchPhrase,
    sort,
    translateEntity,
    valinnanTila,
    vastaanottoTila,
  ]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    sort,
    setSort,
  };
};
