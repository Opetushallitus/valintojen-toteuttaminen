'use client';
import { useMemo } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { isDefined, isEmpty, uniqueBy } from 'remeda';
import { getValintaryhmat } from '@/app/lib/valintaperusteet';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';

export const useValintaryhmaSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'vrsearch',
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

function flattenValintaryhma(ryhma: ValintaryhmaHakukohteilla): ValintaryhmaHakukohteilla[] {
  return [ryhma].concat(ryhma.alaValintaryhmat.flatMap(flattenValintaryhma)).filter(isDefined);
}

function findFlattenedParents(ryhma: ValintaryhmaHakukohteilla, flattenedRyhmat: ValintaryhmaHakukohteilla[]): ValintaryhmaHakukohteilla[] {
  const parents = flattenedRyhmat.filter(r => ryhma.parentOid === r.oid);
  return parents.concat(parents.flatMap(r => findFlattenedParents(r, flattenedRyhmat)));
}

export const useValintaryhmaSearchResults = (hakuOid: string) => {

  const { data: ryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid],
    queryFn: () => getValintaryhmat(hakuOid),
  });

  const flattenedRyhmat = useMemo(() => {
    return ryhmat.flatMap(flattenValintaryhma)
  }, [ryhmat]);

  const { searchPhrase } = useValintaryhmaSearchParams();

  const results = useMemo(() => {
    if (!isEmpty(searchPhrase)) {
      const foundRyhmat = flattenedRyhmat.filter(r => {
        return r.nimi.includes(searchPhrase) || r.oid.includes(searchPhrase);
      });
      const parents = foundRyhmat.flatMap(r => findFlattenedParents(r, flattenedRyhmat));
      return uniqueBy(foundRyhmat.concat(parents), r => r.oid);
    } else {
      return flattenedRyhmat;
    }
  }, [
    searchPhrase,
    flattenedRyhmat,
  ]);

  return {
    results,
    ryhmat,
  };
};
