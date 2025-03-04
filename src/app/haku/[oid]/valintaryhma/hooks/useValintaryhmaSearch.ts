'use client';
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { isDefined, isEmpty, uniqueBy } from 'remeda';
import { getValintaryhmat } from '@/lib/valintaperusteet/valintaperusteet-service';
import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';

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

function flattenValintaryhma(
  ryhma: ValintaryhmaHakukohteilla,
): ValintaryhmaHakukohteilla[] {
  return [ryhma]
    .concat(ryhma.alaValintaryhmat.flatMap(flattenValintaryhma))
    .filter(isDefined);
}

function findFlattenedParents(
  ryhma: ValintaryhmaHakukohteilla,
  flattenedRyhmat: ValintaryhmaHakukohteilla[],
): ValintaryhmaHakukohteilla[] {
  const parents = flattenedRyhmat.filter((r) => ryhma.parentOid === r.oid);
  return parents.concat(
    parents.flatMap((r) => findFlattenedParents(r, flattenedRyhmat)),
  );
}

function filterRyhmatWithHakukohteet(
  ryhmat: ValintaryhmaHakukohteilla[],
): ValintaryhmaHakukohteilla[] {
  return ryhmat.filter(
    (r) =>
      r.hakukohteet.length > 0 ||
      filterRyhmatWithHakukohteet(r.alaValintaryhmat).length > 0,
  );
}

export const useValintaryhmaSearchResults = (hakuOid: string) => {
  const { data: ryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid],
    queryFn: () => getValintaryhmat(hakuOid),
  });

  const flattenedRyhmat = useMemo(() => {
    const flattened = ryhmat.muutRyhmat.flatMap(flattenValintaryhma);
    return filterRyhmatWithHakukohteet(flattened);
  }, [ryhmat]);

  const { searchPhrase } = useValintaryhmaSearchParams();

  const results = useMemo(() => {
    if (!isEmpty(searchPhrase)) {
      const foundRyhmat = flattenedRyhmat.filter((r) => {
        return r.nimi.includes(searchPhrase) || r.oid.includes(searchPhrase);
      });
      const parents = foundRyhmat.flatMap((r) =>
        findFlattenedParents(r, flattenedRyhmat),
      );
      return uniqueBy(foundRyhmat.concat(parents), (r) => r.oid);
    } else {
      return flattenedRyhmat;
    }
  }, [searchPhrase, flattenedRyhmat]);

  return {
    results,
    ryhmat,
  };
};
