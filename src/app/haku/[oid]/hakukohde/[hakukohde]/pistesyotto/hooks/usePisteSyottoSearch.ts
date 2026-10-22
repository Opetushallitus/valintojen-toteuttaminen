import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import {
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  DEFAULT_NUQS_OPTIONS,
} from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { hakemusFilter } from '@/lib/filters';

export const usePisteSyottoSearchParams = () => {
  // Kaikki URL-parametrit samassa useQueryStatesissa, jotta hakuehdon muutos ja sivun nollaus päivittyvät
  // URL:iin yhdellä päivityksellä
  const [
    {
      searchPhrase,
      valittuKoe,
      osallistumisenTila,
      naytaVainLaskentaanVaikuttavat,
      page,
      pageSize,
      sort,
    },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      valittuKoe: parseAsString.withDefault(''),
      osallistumisenTila: parseAsString.withDefault(''),
      naytaVainLaskentaanVaikuttavat: parseAsBoolean.withDefault(true),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      sort: parseAsString.withDefault('hakijanNimi:asc'),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'pisteSyottoSearch',
        valittuKoe: 'koe',
        naytaVainLaskentaanVaikuttavat: 'vainLaskentaanVaikuttavat',
        pageSize: 'page_size',
      },
    },
  );

  const setSearchDebounce = useDebounce(
    (value: string) => setSearchParams({ searchPhrase: value, page: 1 }),
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    page,
    setPage: (value: number) => setSearchParams({ page: value }),
    pageSize,
    setPageSize: (value: number) => setSearchParams({ pageSize: value }),
    sort,
    setSort: (value: string) => setSearchParams({ sort: value }),
    osallistumisenTila,
    setOsallistumisenTila: (value: string) =>
      setSearchParams({ osallistumisenTila: value, page: 1 }),
    valittuKoe,
    setValittukoe: (value: string) =>
      setSearchParams({ valittuKoe: value, page: 1 }),
    naytaVainLaskentaanVaikuttavat,
    setNaytaVainLaskentaanVaikuttavat: (value: boolean) =>
      setSearchParams({ naytaVainLaskentaanVaikuttavat: value, page: 1 }),
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
