import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import { hakemusFilter } from '@/lib/filters';
import { isEmpty } from 'remeda';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';

export const useValinnanTuloksetSearchParams = () => {
  // Kaikki URL-parametrit samassa useQueryStatesissa, jotta hakuehdon muutos ja sivun nollaus päivittyvät
  // URL:iin yhdellä päivityksellä
  const [
    { searchPhrase, valinnanTila, vastaanottoTila, page, pageSize, sort },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      valinnanTila: parseAsString.withDefault(''),
      vastaanottoTila: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      sort: parseAsString.withDefault(''),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'search',
        valinnanTila: 'valinnantila',
        vastaanottoTila: 'vastaanottotila',
        pageSize: 'page_size',
      },
    },
  );

  const setSearchDebounce = useDebounce(
    (value: string) => setSearchParams({ searchPhrase: value, page: 1 }),
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    page,
    setPage: (value: number) => setSearchParams({ page: value }),
    pageSize,
    setPageSize: (value: number) => setSearchParams({ pageSize: value }),
    sort,
    setSort: (value: string) => setSearchParams({ sort: value }),
    valinnanTila,
    setValinnanTila: (value: string) =>
      setSearchParams({ valinnanTila: value, page: 1 }),
    vastaanottoTila,
    setVastaanottoTila: (value: string) =>
      setSearchParams({ vastaanottoTila: value, page: 1 }),
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
