import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import {
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  DEFAULT_NUQS_OPTIONS,
} from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { hakemusFilter } from '@/lib/filters';
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';

export const usePisteSyottoSearchParams = () => {
  const [
    {
      searchPhrase,
      valittuKoe,
      osallistumisenTila,
      naytaVainLaskentaanVaikuttavat,
    },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      valittuKoe: parseAsString.withDefault(''),
      osallistumisenTila: parseAsString.withDefault(''),
      naytaVainLaskentaanVaikuttavat: parseAsBoolean.withDefault(true),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'pisteSyottoSearch',
        valittuKoe: 'koe',
        naytaVainLaskentaanVaikuttavat: 'vainLaskentaanVaikuttavat',
      },
    },
  );

  const paginationParams = usePaginationParams({
    defaultSort: 'hakijanNimi:asc',
  });

  const resetPages = useResetPages();

  const setSearchParamsAndResetPages = (
    values: Parameters<typeof setSearchParams>[0],
  ) => {
    setSearchParams(values);
    resetPages();
  };

  const setSearchDebounce = useDebounce(
    (value: string) => setSearchParamsAndResetPages({ searchPhrase: value }),
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    ...paginationParams,
    osallistumisenTila,
    setOsallistumisenTila: (value: string) =>
      setSearchParamsAndResetPages({ osallistumisenTila: value }),
    valittuKoe,
    setValittuKoe: (value: string) =>
      setSearchParamsAndResetPages({ valittuKoe: value }),
    naytaVainLaskentaanVaikuttavat,
    setNaytaVainLaskentaanVaikuttavat: (value: boolean) =>
      setSearchParamsAndResetPages({ naytaVainLaskentaanVaikuttavat: value }),
  };
};

export const usePisteSyottoSearchResults = (
  hakukohteenPistetiedot: HakukohteenPistetiedot,
) => {
  const { translateEntity } = useTranslations();

  const {
    searchPhrase,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    valittuKoe,
    osallistumisenTila,
    naytaVainLaskentaanVaikuttavat,
  } = usePisteSyottoSearchParams();

  const koeResults = useMemo(() => {
    return valittuKoe.length < 1
      ? hakukohteenPistetiedot.valintakokeet
      : hakukohteenPistetiedot.valintakokeet.filter(
          (k) => k.tunniste === valittuKoe,
        );
  }, [valittuKoe, hakukohteenPistetiedot]);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakukohteenPistetiedot.hakemustenPistetiedot.filter(
      (h) =>
        hakemusFilter(h, searchPhrase) &&
        (osallistumisenTila.length < 1 ||
          h.valintakokeenPisteet.some((koe) => {
            const matchingKoe = koeResults.find(
              (k) => k.tunniste === koe.tunniste,
            );
            return (
              matchingKoe &&
              koe.osallistuminen === osallistumisenTila &&
              (!naytaVainLaskentaanVaikuttavat ||
                matchingKoe.vaatiiOsallistumisen) &&
              (valittuKoe.length < 1 || koe.tunniste === valittuKoe)
            );
          })),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [
    hakukohteenPistetiedot,
    searchPhrase,
    sort,
    translateEntity,
    osallistumisenTila,
    valittuKoe,
    koeResults,
    naytaVainLaskentaanVaikuttavat,
  ]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageResults,
    results,
    sort,
    setSort,
    koeResults,
    naytaVainLaskentaanVaikuttavat,
  };
};
