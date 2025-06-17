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
import {
  filter,
  isEmpty,
  isNonNullish,
  map,
  pipe,
  sortBy,
  toLowerCase,
  unique,
} from 'remeda';
import { isHakukohdeOid } from '@/lib/common';
import { getHakukohteidenSuodatustiedotQueryOptions } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useSearchParams } from 'next/navigation';
import { isBefore, min } from 'date-fns';
import { toFinnishDate } from '@/lib/time-utils';
import { haunAsetuksetQueryOptions } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import {
  HakukohteenSuodatustiedot,
  HakukohteidenSuodatustiedot,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';
import { useKoulutustyypit } from '@/lib/koodisto/useKoulutustyypit';
import { Koodi } from '@/lib/koodisto/koodisto-types';

const SEARCH_TERM_PARAM_NAME = 'hksearch';
const WITH_VALINTAKOE_PARAM_NAME = 'hakukohteet-with-valintakoe';
const VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME = 'varasijataytto-paattamatta';
const LASKETUT_HAKUKOHTEET_PARAM_NAME = 'lasketut';
const SIJOITTELEMATTOMAT_HAKUKOHTEET_PARAM_NAME = 'sijoittelematta';
const JULKAISEMATTOMAT_HAKUKOHTEET_PARAM_NAME = 'julkaisematta';
const KOULUTUSTYYPPI_PARAM_NAME = 'koulutustyyppi';

const HAKUKOHDE_SEARCH_PARAMS = [
  SEARCH_TERM_PARAM_NAME,
  WITH_VALINTAKOE_PARAM_NAME,
  VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME,
  LASKETUT_HAKUKOHTEET_PARAM_NAME,
  SIJOITTELEMATTOMAT_HAKUKOHTEET_PARAM_NAME,
  JULKAISEMATTOMAT_HAKUKOHTEET_PARAM_NAME,
  KOULUTUSTYYPPI_PARAM_NAME,
] as const;

type SelectedFilters = {
  withValintakoe: boolean;
  varasijatayttoPaattamatta: boolean;
  withoutLaskenta: boolean;
  sijoittelematta: boolean;
  julkaisematta: boolean;
  koulutustyyppi: string;
};

const checkIsVarasijatayttoPaattamatta = (
  suodatustieto: HakukohteenSuodatustiedot | undefined,
  haunAsetukset: HaunAsetukset,
  currentDate: Date,
) => {
  const varasijatayttoPaattyy =
    suodatustieto?.varasijatayttoPaattyy && haunAsetukset.varasijatayttoPaattyy
      ? min([
          suodatustieto.varasijatayttoPaattyy,
          haunAsetukset.varasijatayttoPaattyy,
        ])
      : (suodatustieto?.varasijatayttoPaattyy ??
        haunAsetukset.varasijatayttoPaattyy);

  return varasijatayttoPaattyy
    ? isBefore(toFinnishDate(currentDate), varasijatayttoPaattyy)
    : false;
};

export const filterWithSuodatustiedot = ({
  haunAsetukset,
  hakukohteet,
  suodatustiedot,
  selectedFilters,
}: {
  haunAsetukset: HaunAsetukset;
  hakukohteet: Array<Hakukohde>;
  suodatustiedot: HakukohteidenSuodatustiedot;
  selectedFilters: SelectedFilters;
}) => {
  const currentDate = new Date();
  return hakukohteet.filter((hakukohde) => {
    const suodatustieto = suodatustiedot?.[hakukohde.oid];
    return (
      (!selectedFilters.withValintakoe || suodatustieto?.hasValintakoe) &&
      (!selectedFilters.withoutLaskenta || !suodatustieto?.laskettu) &&
      (!selectedFilters.sijoittelematta || suodatustieto.sijoittelematta) &&
      (!selectedFilters.julkaisematta || suodatustieto.julkaisematta) &&
      (isEmpty(selectedFilters.koulutustyyppi) ||
        hakukohde.koulutustyyppikoodi === selectedFilters.koulutustyyppi) &&
      (!selectedFilters.varasijatayttoPaattamatta ||
        checkIsVarasijatayttoPaattamatta(
          suodatustieto,
          haunAsetukset,
          currentDate,
        ))
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

  const [sijoittelematta, setSijoittelematta] = useQueryState(
    SIJOITTELEMATTOMAT_HAKUKOHTEET_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [julkaisematta, setJulkaisematta] = useQueryState(
    JULKAISEMATTOMAT_HAKUKOHTEET_PARAM_NAME,
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [varasijatayttoPaattamatta, setVarasijatayttoPaattamatta] =
    useQueryState(
      VARASIJATAYTTO_PAATTAMATTA_PARAM_NAME,
      parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
    );

  const [koulutustyyppi, setKoulutustyyppi] = useQueryState(
    KOULUTUSTYYPPI_PARAM_NAME,
    DEFAULT_NUQS_OPTIONS,
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
    sijoittelematta,
    setSijoittelematta,
    julkaisematta,
    setJulkaisematta,
    varasijatayttoPaattamatta,
    setVarasijatayttoPaattamatta,
    koulutustyyppi,
    setKoulutustyyppi,
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    isSomeHakukohdeFilterSelected:
      withValintakoe || withoutLaskenta || varasijatayttoPaattamatta,
  };
};

export const useHakukohdeSearchResults = (hakuOid: string) => {
  const { translateEntity } = useTranslations();
  const userPermissions = useUserPermissions();
  const { data: koulutustyypit } = useKoulutustyypit();

  const [
    { data: haunAsetukset },
    { data: hakukohteet },
    { data: suodatustiedot },
  ] = useSuspenseQueries({
    queries: [
      haunAsetuksetQueryOptions({ hakuOid }),
      getHakukohteetQueryOptions(hakuOid, userPermissions),
      getHakukohteidenSuodatustiedotQueryOptions({ hakuOid }),
    ],
  });

  const {
    searchPhrase,
    withValintakoe,
    varasijatayttoPaattamatta,
    withoutLaskenta,
    sijoittelematta,
    julkaisematta,
    koulutustyyppi,
  } = useHakukohdeSearchParamsState();

  const koulutustyyppiOptions: Array<Koodi> = pipe(
    hakukohteet,
    map((hakukohde) => hakukohde.koulutustyyppikoodi),
    unique(),
    map((koodi) => koulutustyypit.find((kt) => kt.koodiUri === koodi)),
    filter(isNonNullish),
  );

  const sortedHakukohteet = useMemo(() => {
    const filteredHakukohteet = filterWithSuodatustiedot({
      haunAsetukset,
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe,
        varasijatayttoPaattamatta,
        withoutLaskenta,
        sijoittelematta,
        julkaisematta,
        koulutustyyppi,
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
    haunAsetukset,
    sijoittelematta,
    julkaisematta,
    koulutustyyppi,
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
    koulutustyyppiOptions,
  };
};
