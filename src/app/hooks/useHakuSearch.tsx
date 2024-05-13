'use client';
import { useEffect, useMemo } from 'react';
import {
  Haku,
  HaunAlkaminen,
  Tila,
  getHakuAlkamisKaudet,
} from '../lib/kouta-types';
import { Language, byProp, getTranslation } from '../lib/common';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { getSortParts } from '../components/table/list-table';
import { getHaut } from '../lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useHakutavat } from './useHakutavat';

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

const KAUSI_MAPPING = Object.freeze({
  kausi_s: {
    fi: 'Syksy',
    sv: 'Höst',
    en: 'Autumn',
  },
  kausi_k: {
    fi: 'Kevät',
    sv: 'Vår',
    en: 'Spring',
  },
});

const getKausiVuosiTranslation = (kausiUri: string, vuosi: number) => {
  if (kausiUri === 'kausi_s' || kausiUri === 'kausi_k') {
    const kausiName = KAUSI_MAPPING?.[kausiUri];
    return {
      fi: `${vuosi} ${kausiName.fi}`,
      sv: `${vuosi} ${kausiName.sv}`,
      en: `${vuosi} ${kausiName.en}`,
    };
  }
};

export const useHakuSearchParams = () => {
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
    sort,
    setSort,
  };
};

export const useHakuSearchResults = () => {
  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);
  const { data: hakutavat } = useHakutavat();

  const { data: haut } = useSuspenseQuery({
    queryKey: ['getHaut'],
    queryFn: () => getHaut(),
    select: (haut) =>
      haut.map((haku) => ({
        ...haku,
        hakutapaNimi: hakutavat.find(
          (hakutapa) => hakutapa.koodiUri === haku.hakutapaKoodiUri,
        )?.nimi,
        alkamiskausiNimi: getKausiVuosiTranslation(
          haku.alkamisKausiKoodiUri?.split('#')?.[0],
          haku.alkamisVuosi,
        ),
      })),
  });

  const {
    searchPhrase,
    myosArkistoidut,
    selectedHakutapa,
    selectedAlkamisKausi,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  } = useHakuSearchParams();

  const results = useMemo(() => {
    const tilat = myosArkistoidut
      ? [Tila.JULKAISTU, Tila.ARKISTOITU]
      : [Tila.JULKAISTU];

    const { orderBy, direction } = getSortParts(sort);

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
