import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '../components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { LaskennanJonosijaTulosWithHakijaInfo } from './useEditableValintalaskennanTulokset';
import { hakemusFilter } from '../lib/filters';

export const useJonoTuloksetSearchParams = (id?: string) => {
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
        urlKeys: {
          searchPhrase: 'search',
          page: `page-${id}`,
          pageSize: 'page_size',
          sort: `sort-${id}`,
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
  };
};

export const useJonoTuloksetSearch = (
  jonoId: string,
  jonoTulos: Array<LaskennanJonosijaTulosWithHakijaInfo>,
) => {
  const { translateEntity } = useTranslations();

  const { searchPhrase, page, setPage, pageSize, setPageSize, sort, setSort } =
    useJonoTuloksetSearchParams(jonoId);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = jonoTulos.filter((j) => hakemusFilter(j, searchPhrase));

    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [jonoTulos, searchPhrase, sort, translateEntity]);

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
