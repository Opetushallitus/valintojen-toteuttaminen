'use client';
import { useMemo } from 'react';
import { Hakukohde } from '@/lib/kouta/kouta-types';
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
import {
  getHakukohteidenSuodatustiedotQueryOptions,
  HakukohteidenSuodatustiedot,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useSearchParams } from 'next/navigation';
import { isBefore } from 'date-fns';
import { toFinnishDate } from '@/lib/time-utils';

const SEARCH_TERM_PARAM_NAME = 'hksearch';
const WITH_VALINTAKOE_PARAM_NAME = 'hakukohteet-with-valintakoe';
const VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME = 'varasijataytto-paattamatta';
const LASKETUT_HAKUKOHTEET_PARAM_NAME = 'lasketut';

const HAKUKOHDE_SEARCH_PARAMS = [
  SEARCH_TERM_PARAM_NAME,
  WITH_VALINTAKOE_PARAM_NAME,
  VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME,
  LASKETUT_HAKUKOHTEET_PARAM_NAME,
] as const;

type SelectedFilters = {
  withValintakoe: boolean;
  varasijatayttoPaattamatta: boolean;
  withoutLaskenta: boolean;
};

export const filterWithSuodatustiedot = ({
  hakukohteet,
  suodatustiedot,
  selectedFilters,
}: {
  hakukohteet: Array<Hakukohde>;
  suodatustiedot: HakukohteidenSuodatustiedot;
  selectedFilters: SelectedFilters;
}) => {
  return hakukohteet.filter((hakukohde) => {
    const suodatustieto = suodatustiedot?.[hakukohde.oid];
    return (
      (!selectedFilters.withValintakoe || suodatustieto?.hasValintakoe) &&
      (!selectedFilters.withoutLaskenta || !suodatustieto?.laskettu) &&
      (!selectedFilters.varasijatayttoPaattamatta ||
        (suodatustieto?.varasijatayttoPaattyy &&
          isBefore(
            toFinnishDate(new Date()),
            suodatustieto?.varasijatayttoPaattyy,
          )))
    );
  });
};

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
    SEARCH_TERM_PARAM_NAME,
    DEFAULT_NUQS_OPTIONS,
  );

  const [withValintakoe, setWithValintakoe] = useQueryState(
    WITH_VALINTAKOE_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [withoutLaskenta, setWithoutLaskenta] = useQueryState(
    LASKETUT_HAKUKOHTEET_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );
  const [varasijatayttoPaattamatta, setVarasijatayttoPaattamatta] =
    useQueryState(
      VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME,
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
    varasijatayttoPaattamatta,
    setVarasijatayttoPaattamatta,
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

  const {
    searchPhrase,
    withValintakoe,
    varasijatayttoPaattamatta,
    withoutLaskenta,
  } = useHakukohdeSearchParamsState();

  const sortedHakukohteet = useMemo(() => {
    const filteredHakukohteet = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe,
        varasijatayttoPaattamatta,
        withoutLaskenta,
      },
    });

    return sortBy(filteredHakukohteet, (hakukohde: Hakukohde) =>
      translateEntity(hakukohde.nimi),
    );
  }, [
    hakukohteet,
    translateEntity,
    withValintakoe,
    suodatustiedot,
    withoutLaskenta,
    varasijatayttoPaattamatta,
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
