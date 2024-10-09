import { DEFAULT_NUQS_OPTIONS } from '@/app/hooks/common';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { useHarkinnanvaraisetPaginationQueryParams } from './useHarkinnanvaraisetPaginated';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useHasChanged } from '@/app/hooks/useHasChanged';

export const useHarkinnanvaraisetSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'harkinnanvaraisetSearch',
    DEFAULT_NUQS_OPTIONS,
  );

  const { setPage } = useHarkinnanvaraisetPaginationQueryParams();

  const searchPhraseChanged = useHasChanged(searchPhrase);

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  useEffect(() => {
    if (searchPhraseChanged) {
      setPage(1);
    }
  }, [searchPhraseChanged, setPage]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
  };
};
