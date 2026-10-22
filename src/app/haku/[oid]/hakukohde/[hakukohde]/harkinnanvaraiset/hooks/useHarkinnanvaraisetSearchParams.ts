import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';

export const useHarkinnanvaraisetSearchParams = () => {
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
          searchPhrase: 'search-harkinnanvaraiset',
          page: 'page-harkinnanvaraiset',
          pageSize: 'page_size-harkinnanvaraiset',
          sort: 'sort-harkinnanvaraiset',
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
