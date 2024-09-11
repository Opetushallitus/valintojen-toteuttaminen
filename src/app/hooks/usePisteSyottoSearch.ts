'use client';
import { useEffect, useMemo } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import {
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { HakukohteenPistetiedot } from '../lib/types/laskenta-types';
import { hakemusFilter } from './filters';
import { DEFAULT_NUQS_OPTIONS } from './common';

export const usePisteSyottoSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'pisteSyottoSearch',
    DEFAULT_NUQS_OPTIONS,
  );

  const [valittuKoe, setValittukoe] = useQueryState(
    'koe',
    DEFAULT_NUQS_OPTIONS,
  );

  const [osallistumisenTila, setOsallistumisenTila] = useQueryState(
    'osallistumisenTila',
    DEFAULT_NUQS_OPTIONS,
  );

  const [naytaVainLaskentaanVaikuttavat, setNaytaVainLaskentaanVaikuttavat] =
    useQueryState<boolean>(
      'vainLaskentaanVaikuttavat',
      parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(true),
    );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [page, setPage] = useQueryState<number>(
    'page',
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  const [sort, setSort] = useQueryState(
    'sort',
    Object.assign({}, DEFAULT_NUQS_OPTIONS, {
      defaultValue: 'hakijanNimi:asc',
    }),
  );

  const searchPhraseChanged = useHasChanged(searchPhrase);

  const koeChanged = useHasChanged(valittuKoe);

  const osallistumisenTilaChanged = useHasChanged(osallistumisenTila);

  const vainLaskentaanVaikuttavatChanged = useHasChanged(
    naytaVainLaskentaanVaikuttavat,
  );

  useEffect(() => {
    if (
      searchPhraseChanged ||
      koeChanged ||
      osallistumisenTilaChanged ||
      vainLaskentaanVaikuttavatChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    setPage,
    koeChanged,
    osallistumisenTilaChanged,
    vainLaskentaanVaikuttavatChanged,
  ]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    osallistumisenTila,
    setOsallistumisenTila,
    valittuKoe,
    setValittukoe,
    naytaVainLaskentaanVaikuttavat,
    setNaytaVainLaskentaanVaikuttavat,
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
    return (
      valittuKoe.length < 1
        ? hakukohteenPistetiedot.valintakokeet
        : hakukohteenPistetiedot.valintakokeet.filter(
            (k) => k.tunniste === valittuKoe,
          )
    ).filter((k) => !naytaVainLaskentaanVaikuttavat || k.vaatiiOsallistumisen);
  }, [valittuKoe, hakukohteenPistetiedot, naytaVainLaskentaanVaikuttavat]);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakukohteenPistetiedot.hakemukset.filter(
      (h) =>
        hakemusFilter(h, searchPhrase) &&
        (osallistumisenTila.length < 1 ||
          h.valintakokeenPisteet.some(
            (koe) =>
              koeResults.some((k) => k.tunniste === koe.tunniste) &&
              koe.osallistuminen === osallistumisenTila &&
              (valittuKoe.length < 1 || koe.tunniste === valittuKoe),
          )),
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
  };
};
