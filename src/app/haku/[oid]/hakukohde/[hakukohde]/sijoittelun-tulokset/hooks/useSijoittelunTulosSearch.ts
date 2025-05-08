'use client';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/hooks/useHasChanged';
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
import { sortBySijoittelunTila } from '@/lib/sortBySijoittelunTila';
import { isHyvaksyttyHarkinnanvaraisesti } from '@/lib/sijoittelun-tulokset-utils';

const DEFAULT_PAGE_SIZE = 10;

export const useSijoittelunTulosSearchParams = (
  valintatapajonoOid?: string,
) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    `search`,
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [sijoittelunTila, setSijoittelunTila] = useQueryState(
    'tila',
    DEFAULT_NUQS_OPTIONS,
  );

  const [showOnlyEhdolliset, setShowOnlyEhdolliset] = useQueryState<boolean>(
    'ehdolliset',
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa,
  ] = useQueryState<boolean>(
    'muuttuneetViimeSijoittelussa',
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [page, setPage] = useQueryState<number>(
    `page-${valintatapajonoOid}`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  const [sort, setSort] = useState<string>('');

  const searchPhraseChanged = useHasChanged(searchPhrase);

  const tilaChanged = useHasChanged(sijoittelunTila);

  const ehdollisetChanged = useHasChanged(showOnlyEhdolliset);

  const muuttuneetChanged = useHasChanged(showOnlyMuuttuneetViimeSijoittelussa);

  useEffect(() => {
    if (
      searchPhraseChanged ||
      tilaChanged ||
      ehdollisetChanged ||
      muuttuneetChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    setPage,
    tilaChanged,
    ehdollisetChanged,
    muuttuneetChanged,
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
    sijoittelunTila,
    setSijoittelunTila,
    showOnlyEhdolliset,
    setShowOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa,
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
        return sortBySijoittelunTila(direction, filtered);
      }
      if (orderBy === 'sija') {
        return filtered.sort((a, b) => {
          const asc = direction === 'asc';
          const aVal = a.sija ?? Number.MAX_VALUE;
          const bVal = b.sija ?? Number.MAX_VALUE;
          return asc ? bVal - aVal : aVal - bVal;
        });
      }
      return filtered.sort(byProp(orderBy, direction, translateEntity));
    };

    const { orderBy, direction } = getSortParts(sort);

    return orderBy && direction
      ? sortHakijat(orderBy, direction)
      : sortBySijoittelunTila(direction ?? 'asc', filtered);
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
