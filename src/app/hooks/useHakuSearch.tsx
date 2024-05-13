'use client';
import { useEffect, useMemo } from 'react';
import { Haku, HaunAlkaminen, Tila } from '../lib/kouta-types';
import { Language, byProp, getTranslation } from '../lib/common';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { getSortParts } from '../components/table/list-table';

export const DEFAULT_PAGE_SIZE = 30;

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;

export const alkamisKausiMatchesSelected = (
  haku: Haku,
  selectedAlkamisKausi?: HaunAlkaminen,
): boolean =>
  !selectedAlkamisKausi ||
  (haku.alkamisVuosi === selectedAlkamisKausi.alkamisVuosi &&
    haku.alkamisKausiKoodiUri.startsWith(
      selectedAlkamisKausi.alkamisKausiKoodiUri,
    ));

export const useHakuSearch = (
  haut: Array<Haku>,
  alkamiskaudet: Array<HaunAlkaminen>,
) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'search',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(setSearchPhrase, 500);

  const [myosArkistoidut, setMyosArkistoidut] = useQueryState(
    'arkistoidut',
    parseAsBoolean.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(false),
  );

  const [selectedHakutapa, setSelectedHakutapa] = useQueryState(
    'hakutapa',
    DEFAULT_NUQS_OPTIONS,
  );

  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useQueryState(
    'alkamiskausi',
    DEFAULT_NUQS_OPTIONS,
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

  const [sort, setSort] = useQueryState('sort', DEFAULT_NUQS_OPTIONS);

  const myosArkistoidutChanged = useHasChanged(myosArkistoidut);
  const searchPhraseChanged = useHasChanged(searchPhrase);
  const selectedAlkamisKausiChanged = useHasChanged(selectedAlkamisKausi);
  const selectedHakutapaChanged = useHasChanged(selectedHakutapa);

  useEffect(() => {
    if (
      searchPhraseChanged ||
      myosArkistoidutChanged ||
      selectedHakutapaChanged ||
      selectedAlkamisKausiChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    myosArkistoidutChanged,
    selectedHakutapaChanged,
    selectedAlkamisKausiChanged,
    setPage,
  ]);

  const results = useMemo(() => {
    const tilat = myosArkistoidut
      ? [Tila.JULKAISTU, Tila.ARKISTOITU]
      : [Tila.JULKAISTU];

    const { orderBy, direction } = getSortParts(sort ?? '');

    const filtered = haut.filter(
      (haku: Haku) =>
        tilat.includes(haku.tila) &&
        getTranslation(haku.nimi)
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() ?? '') &&
        alkamisKausiMatchesSelected(
          haku,
          alkamiskaudet.find((k) => k.value === selectedAlkamisKausi),
        ) &&
        haku.hakutapaKoodiUri.startsWith(selectedHakutapa ?? ''),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, Language.FI))
      : filtered;
  }, [
    haut,
    searchPhrase,
    myosArkistoidut,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
    sort,
  ]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    myosArkistoidut,
    setMyosArkistoidut: setMyosArkistoidut,
    selectedHakutapa,
    setSelectedHakutapa,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageResults,
    results,
    sort,
    setSort,
  };
};
