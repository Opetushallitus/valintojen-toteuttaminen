'use client';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { getHakemukset } from '@/app/lib/ataru';
import { DEFAULT_NUQS_OPTIONS } from '@/app/hooks/common';
import { isEmpty } from 'remeda';
import { EMPTY_ARRAY } from '@/app/lib/common';

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

const isHakemusOid = (val: string) => /^1\.2\.246\.562\.11\.\d{20}$/.test(val);

export const useHenkiloSearchResults = ({ hakuOid }: { hakuOid: string }) => {
  const { searchPhrase } = useHenkiloSearchParams();

  const hakemusOids = isHakemusOid(searchPhrase) ? [searchPhrase] : EMPTY_ARRAY;

  const name = isEmpty(hakemusOids) ? searchPhrase : undefined;

  return useQuery({
    queryKey: ['getHakemukset', hakuOid, name, hakemusOids],
    queryFn: () => getHakemukset({ hakuOid, name, hakemusOids }),
    enabled: searchPhrase?.length >= 3,
  });
};
