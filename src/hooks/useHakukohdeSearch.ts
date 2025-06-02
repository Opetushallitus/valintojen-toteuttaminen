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
import { useSearchParams } from 'next/navigation';

const HAKUKOHTEET_SEARCH_TERM_PARAM_NAME = 'hksearch';
const HAKUKOHTEET_WITH_VALINTAKOE_PARAM_NAME = 'hakukohteet-with-valintakoe';
const LASKETUT_HAKUKOHTEET_PARAM_NAME = 'lasketut';

const HAKUKOHDE_SEARCH_PARAMS = [
  HAKUKOHTEET_SEARCH_TERM_PARAM_NAME,
  HAKUKOHTEET_WITH_VALINTAKOE_PARAM_NAME,
  LASKETUT_HAKUKOHTEET_PARAM_NAME,
] as const;

export const useHakukohdeSearchUrlParams = () => {
  const searchParams = useSearchParams();
  const params: Record<string, string> = {};
  HAKUKOHDE_SEARCH_PARAMS.forEach((param) => {
    const value = searchParams.get(param);
    if (value) {
      params[param] = value;
    }
  });
  return isEmpty(params) ? undefined : params;
};

export const useHakukohdeSearchParamsState = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    HAKUKOHTEET_SEARCH_TERM_PARAM_NAME,
    DEFAULT_NUQS_OPTIONS,
  );

  const [withValintakoe, setWithValintakoe] = useQueryState(
    HAKUKOHTEET_WITH_VALINTAKOE_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [withoutLaskenta, setWithoutLaskenta] = useQueryState(
    LASKETUT_HAKUKOHTEET_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    withValintakoe,
    setWithValintakoe,
    withoutLaskenta,
    setWithoutLaskenta,
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
  };
};

export const useHakukohdeSearchResults = (hakuOid: string) => {
  const { translateEntity } = useTranslations();
  const userPermissions = useUserPermissions();

  const [{ data: hakukohteet }, { data: suodatustiedot }] = useSuspenseQueries({
    queries: [
      getHakukohteetQueryOptions(hakuOid, userPermissions),
      getHakukohteidenSuodatustiedotQueryOptions({ hakuOid }),
    ],
  });

  const { searchPhrase, withValintakoe, withoutLaskenta } =
    useHakukohdeSearchParamsState();

  const sortedHakukohteet = useMemo(() => {
    const filteredHakukohteet = hakukohteet
      .filter(
        (hakukohde) =>
          !withValintakoe || suodatustiedot?.[hakukohde.oid]?.hasValintakoe,
      )
      .filter(
        (hakukohde) =>
          !withoutLaskenta || !suodatustiedot?.[hakukohde.oid]?.laskettu,
      );
    return sortBy(filteredHakukohteet, (hakukohde: Hakukohde) =>
      translateEntity(hakukohde.nimi),
    );
  }, [
    hakukohteet,
    translateEntity,
    withValintakoe,
    suodatustiedot,
    withoutLaskenta,
  ]);

  const hakukohdeMatchTargetsByHakukohdeOid = useMemo(
    () =>
      hakukohteet.reduce(
        (acc, hakukohde) => {
          return {
            ...acc,
            [hakukohde.oid]: toLowerCase(
              translateEntity(hakukohde.nimi) +
                '#' +
                translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi),
            ),
          };
        },
        {} as Record<string, string>,
      ),
    [hakukohteet, translateEntity],
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
      return sortedHakukohteet.filter((hakukohde) => {
        const hakukohdeTarget =
          hakukohdeMatchTargetsByHakukohdeOid[hakukohde.oid];
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
    hakukohdeMatchTargetsByHakukohdeOid,
  ]);

  return {
    results,
  };
};
