import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import {
  byProp,
  getSortParts,
  SortDirection,
} from '@/components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
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
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';

/**
 * Kaikille valintatapajonoille yhteiset hakuehdot ja sivukoko. Sivu ja järjestys ovat jonokohtaisia
 * (ks. usePaginationParams). Hakuehdon muutos palauttaa kaikkien jonojen sivutuksen ensimmäiselle sivulle.
 */
export const useSijoittelunTulosSearchParams = () => {
  const [
    {
      searchPhrase,
      sijoittelunTila,
      showOnlyEhdolliset,
      showOnlyMuuttuneetViimeSijoittelussa,
    },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      sijoittelunTila: parseAsString.withDefault(''),
      showOnlyEhdolliset: parseAsBoolean.withDefault(false),
      showOnlyMuuttuneetViimeSijoittelussa: parseAsBoolean.withDefault(false),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'search',
        sijoittelunTila: 'tila',
        showOnlyEhdolliset: 'ehdolliset',
        showOnlyMuuttuneetViimeSijoittelussa: 'muuttuneetViimeSijoittelussa',
      },
    },
  );

  const { pageSize, setPageSize } = usePaginationParams();

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
    pageSize,
    setPageSize,
    sijoittelunTila,
    setSijoittelunTila: (value: string) =>
      setSearchParamsAndResetPages({ sijoittelunTila: value }),
    showOnlyEhdolliset,
    setShowOnlyEhdolliset: (value: boolean) =>
      setSearchParamsAndResetPages({ showOnlyEhdolliset: value }),
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa: (value: boolean) =>
      setSearchParamsAndResetPages({
        showOnlyMuuttuneetViimeSijoittelussa: value,
      }),
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
    sijoittelunTila,
    showOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
  } = useSijoittelunTulosSearchParams();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    usePaginationParams({ tableId: valintatapajonoOid });

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
