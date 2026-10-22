import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import {
  byProp,
  getSortParts,
  SortDirection,
} from '@/components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  SijoittelunHakemusValintatiedoilla,
  ValinnanTila,
} from '@/lib/types/sijoittelu-types';
import { hakemusFilter } from '@/lib/filters';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';
import { isHyvaksyttyHarkinnanvaraisesti } from '@/lib/sijoittelun-tulokset-utils';

export const useSijoittelunTulosSearchParams = (
  valintatapajonoOid?: string,
) => {
  // Kaikki URL-parametrit samassa useQueryStatesissa, jotta hakuehdon muutos ja sivun nollaus päivittyvät
  // URL:iin yhdellä päivityksellä
  const [
    {
      searchPhrase,
      sijoittelunTila,
      showOnlyEhdolliset,
      showOnlyMuuttuneetViimeSijoittelussa,
      page,
      pageSize,
      sort,
    },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      sijoittelunTila: parseAsString.withDefault(''),
      showOnlyEhdolliset: parseAsBoolean.withDefault(false),
      showOnlyMuuttuneetViimeSijoittelussa: parseAsBoolean.withDefault(false),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      sort: parseAsString.withDefault(''),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'search',
        sijoittelunTila: 'tila',
        showOnlyEhdolliset: 'ehdolliset',
        showOnlyMuuttuneetViimeSijoittelussa: 'muuttuneetViimeSijoittelussa',
        page: `page-${valintatapajonoOid}`,
        pageSize: 'page_size',
        sort: `sort-${valintatapajonoOid}`,
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
    sijoittelunTila,
    setSijoittelunTila: (value: string) =>
      setSearchParams({ sijoittelunTila: value, page: 1 }),
    showOnlyEhdolliset,
    setShowOnlyEhdolliset: (value: boolean) =>
      setSearchParams({ showOnlyEhdolliset: value, page: 1 }),
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa: (value: boolean) =>
      setSearchParams({ showOnlyMuuttuneetViimeSijoittelussa: value, page: 1 }),
  };
};

const filterBySijoittelunTila = (
  hakemus: SijoittelunHakemusValintatiedoilla,
  tila: string,
) => {
  const harkinnanvaraisestiHyvaksytty =
    isHyvaksyttyHarkinnanvaraisesti(hakemus);
  return (
    tila.length < 1 ||
    hakemus.valinnanTila === tila ||
    (tila === ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY &&
      harkinnanvaraisestiHyvaksytty)
  );
};

export const useSijoittelunTulosSearch = (
  valintatapajonoOid: string,
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>,
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
    sijoittelunTila,
    showOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
  } = useSijoittelunTulosSearchParams(valintatapajonoOid);

  const results = useMemo(() => {
    const filtered = hakemukset.filter(
      (hakemus) =>
        filterBySijoittelunTila(hakemus, sijoittelunTila) &&
        (!showOnlyMuuttuneetViimeSijoittelussa ||
          hakemus.onkoMuuttunutViimeSijoittelussa) &&
        (!showOnlyEhdolliset || hakemus.ehdollisestiHyvaksyttavissa) &&
        hakemusFilter(hakemus, searchPhrase),
    );

    const sortHakijat = (orderBy: string, direction: SortDirection) => {
      if (orderBy === 'sijoittelunTila') {
        return sortByValinnanTila(direction, filtered);
      }
      return filtered.sort(byProp(orderBy, direction, translateEntity));
    };

    const { orderBy, direction } = getSortParts(sort);

    return orderBy && direction
      ? sortHakijat(orderBy, direction)
      : sortByValinnanTila(direction ?? 'asc', filtered);
  }, [
    hakemukset,
    searchPhrase,
    sort,
    translateEntity,
    sijoittelunTila,
    showOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
  ]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    sort,
    setSort,
  };
};
