'use client';
import { useMemo } from 'react';
import { Hakukohde } from '../lib/types/kouta-types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { getHakukohteetQueryOptions } from '../lib/kouta';
import { useUserPermissions } from './useUserPermissions';
import { isEmpty, sortBy, toLowerCase } from 'remeda';
import { isHakukohdeOid } from '@/app/lib/common';

export const useHakukohdeSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'hksearch',
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

export const useHakukohdeSearchResults = (hakuOid: string) => {
  const { translateEntity } = useTranslations();
  const { data: userPermissions } = useUserPermissions();

  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  const sortedHakukohteet = useMemo(() => {
    return sortBy(hakukohteet, (hakukohde: Hakukohde) =>
      translateEntity(hakukohde.nimi),
    );
  }, [hakukohteet, translateEntity]);

  const hakukohdeMatchTargets = useMemo(
    () =>
      sortedHakukohteet.map((hakukohde) =>
        toLowerCase(
          translateEntity(hakukohde.nimi) +
            '#' +
            translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi),
        ),
      ),
    [sortedHakukohteet, translateEntity],
  );

  const { searchPhrase } = useHakukohdeSearchParams();

  const searchPhraseWords = useMemo(
    () =>
      searchPhrase
        .toLowerCase()
        .split(/\s+/)
        .filter((s) => !isEmpty(s)),
    [searchPhrase],
  );

  const results = useMemo(() => {
    if (isHakukohdeOid(searchPhrase)) {
      const matchingHakukohde = sortedHakukohteet.find(
        (hakukohde) => hakukohde.oid === searchPhrase,
      );
      return matchingHakukohde ? [matchingHakukohde] : [];
    } else if (!isEmpty(searchPhraseWords)) {
      return sortedHakukohteet.filter((_, index) => {
        const hakukohdeTarget = hakukohdeMatchTargets[index];
        return searchPhraseWords.every((word) =>
          hakukohdeTarget.includes(word),
        );
      });
    } else {
      return sortedHakukohteet;
    }
  }, [
    sortedHakukohteet,
    searchPhrase,
    searchPhraseWords,
    hakukohdeMatchTargets,
  ]);

  return {
    results,
  };
};
