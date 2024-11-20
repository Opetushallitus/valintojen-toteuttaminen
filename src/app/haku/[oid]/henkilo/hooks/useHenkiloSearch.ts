'use client';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { getHakijat } from '@/app/lib/ataru';
import { DEFAULT_NUQS_OPTIONS } from '@/app/hooks/common';
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

const isHakemusOid = (value: string) =>
  /^1\.2\.246\.562\.11\.\d{20}$/.test(value);

const isHenkiloOid = (value: string) => /^1\.2\.246\.562\.24\.\d+$/.test(value);

const isHenkilotunnus = (value: string) =>
  /^\d{6}[a-zA-Z-]\d{3}\S{1}$/i.test(value);

export const useHenkiloSearchResults = ({ hakuOid }: { hakuOid: string }) => {
  const { searchPhrase } = useHenkiloSearchParams();

  let hakemusOids: Array<string> = EMPTY_ARRAY;
  let henkiloOid: string | undefined = undefined;
  let henkilotunnus: string | undefined = undefined;
  let name: string | undefined = undefined;

  switch (true) {
    case isHakemusOid(searchPhrase):
      hakemusOids = [searchPhrase];
      break;
    case isHenkiloOid(searchPhrase):
      henkiloOid = searchPhrase;
      break;
    case isHenkilotunnus(searchPhrase):
      henkilotunnus = searchPhrase;
      break;
    default:
      name = searchPhrase;
      break;
  }
  return useQuery({
    queryKey: [
      'getHakemukset',
      hakuOid,
      name,
      hakemusOids,
      henkiloOid,
      henkilotunnus,
    ],
    queryFn: () =>
      getHakijat({ hakuOid, name, hakemusOids, henkiloOid, henkilotunnus }),
    enabled: searchPhrase?.length >= 3,
  });
};
