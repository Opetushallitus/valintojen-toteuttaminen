'use client';
import { useMemo } from 'react';
import { Hakukohde } from '../lib/kouta/kouta-types';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useSuspenseQueries } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { getHakukohteetQueryOptions } from '../lib/kouta/kouta-service';
import { useUserPermissions } from './useUserPermissions';
import { isEmpty, sortBy, toLowerCase } from 'remeda';
import { isHakukohdeOid } from '@/lib/common';
import { getHakukohteidenSuodatustiedotQueryOptions } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

export const useHakukohdeSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'hakukohteet-search',
    DEFAULT_NUQS_OPTIONS,
  );

  const [withValintakoe, setWithValintakoe] = useQueryState(
    'hakukohteet-with-valintakoe',
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    withValintakoe,
    setWithValintakoe,
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
  };
};

export const useHakukohdeSearchResults = (hakuOid: string) => {
  const { translateEntity } = useTranslations();
  const { data: userPermissions } = useUserPermissions();

  const [{ data: hakukohteet }, { data: suodatustiedot }] = useSuspenseQueries({
    queries: [
      getHakukohteetQueryOptions(hakuOid, userPermissions),
      getHakukohteidenSuodatustiedotQueryOptions({ hakuOid }),
    ],
  });

  const { searchPhrase, withValintakoe } = useHakukohdeSearchParams();

  const sortedHakukohteet = useMemo(() => {
    const filteredHakukohteet = withValintakoe
      ? hakukohteet.filter(
          (hakukohde) => suodatustiedot?.[hakukohde.oid]?.hasValintakoe,
        )
      : hakukohteet;
    return sortBy(filteredHakukohteet, (hakukohde: Hakukohde) =>
      translateEntity(hakukohde.nimi),
    );
  }, [hakukohteet, translateEntity, withValintakoe, suodatustiedot]);

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
