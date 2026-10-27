import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';

export const HARKINNANVARAISET_TABLE_ID = 'harkinnanvaraiset';

export const useHarkinnanvaraisetSearchParams = () => {
  const [{ searchPhrase }, setSearchParams] = useQueryStates(
    { searchPhrase: parseAsString.withDefault('') },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: { searchPhrase: 'search-harkinnanvaraiset' },
    },
  );

  const paginationParams = usePaginationParams({
    tableId: HARKINNANVARAISET_TABLE_ID,
  });

  const resetPages = useResetPages();

  const setSearchDebounce = useDebounce((value: string) => {
    setSearchParams({ searchPhrase: value });
    resetPages();
  }, HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    ...paginationParams,
  };
};
