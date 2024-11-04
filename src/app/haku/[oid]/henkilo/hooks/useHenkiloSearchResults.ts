'use client';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { getHakemukset } from '@/app/lib/ataru';
import { DEFAULT_NUQS_OPTIONS } from '@/app/hooks/common';

export const useHenkiloSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'henkilosearch',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
  };
};

export const useHenkiloSearchResults = ({ hakuOid }: { hakuOid: string }) => {
  const { searchPhrase } = useHenkiloSearchParams();

  return useQuery({
    queryKey: ['getHakemukset', hakuOid, searchPhrase],
    queryFn: () => getHakemukset({ hakuOid, name: searchPhrase }),
    enabled: searchPhrase?.length >= 3,
  });
};
