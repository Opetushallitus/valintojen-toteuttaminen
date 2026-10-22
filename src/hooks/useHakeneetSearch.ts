import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '../components/table/table-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { hakemusFilter } from '../lib/filters';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';

export const useHakeneetSearchParams = () => {
  // Kaikki URL-parametrit samassa useQueryStatesissa, jotta hakutermin muutos ja sivun nollaus päivittyvät
  // URL:iin yhdellä päivityksellä
  const [{ searchPhrase, page, pageSize, sort }, setSearchParams] =
    useQueryStates(
      {
        searchPhrase: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
        pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
        sort: parseAsString.withDefault(''),
      },
      {
        ...DEFAULT_NUQS_OPTIONS,
        urlKeys: { searchPhrase: 'hakeneetSearch', pageSize: 'page_size' },
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
  };
};

export const useHakeneetSearchResults = (
  hakuOid: string,
  hakukohdeOid: string,
) => {
  const { translateEntity } = useTranslations();

  const { data: hakeneet } = useSuspenseQuery(
    queryOptionsGetHakemukset({ hakuOid, hakukohdeOid }),
  );

  const { searchPhrase, page, setPage, pageSize, setPageSize, sort, setSort } =
    useHakeneetSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakeneet.filter((h) => hakemusFilter(h, searchPhrase));
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [hakeneet, searchPhrase, sort, translateEntity]);

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
    unfilteredResults: hakeneet,
  };
};
