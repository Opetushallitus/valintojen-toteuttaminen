'use client';
import { useEffect, useMemo } from 'react';
import {
  Haku,
  HaunAlkaminen,
  Tila,
  getHakuAlkamisKaudet,
} from '../lib/kouta-types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import { getHaut } from '../lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useHakutavat } from './useHakutavat';
import {
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { useUserPermissions } from './useUserPermissions';
import { TranslatedName } from '../lib/localization/localization-types';

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;

const alkamisKausiMatchesSelected = (
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

export type HakuListItem = Haku & {
  hakutapaNimi?: TranslatedName;
  alkamiskausiNimi?: TranslatedName;
};

export const useHakuSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'search',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [tila, setTila] = useQueryState('tila', {
    history: 'push',
    clearOnDefault: false,
  });

  // Näytetään oletuksena vain julkaistut. Huom! Jos käyttäjä tyhjentää tila-kentän itse, URL-parametriksi tulee "tila=",
  // jolloin tämä ei aseta kentän arvoa tilaan "julkaistu"
  useEffect(() => {
    if (tila === null) {
      setTila('julkaistu');
    }
  }, [tila, setTila]);

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

  const tilachanged = useHasChanged(tila);
  const searchPhraseChanged = useHasChanged(searchPhrase);
  const selectedAlkamisKausiChanged = useHasChanged(selectedAlkamisKausi);
  const selectedHakutapaChanged = useHasChanged(selectedHakutapa);

  useEffect(() => {
    if (
      searchPhraseChanged ||
      tilachanged ||
      selectedHakutapaChanged ||
      selectedAlkamisKausiChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    tilachanged,
    selectedHakutapaChanged,
    selectedAlkamisKausiChanged,
    setPage,
  ]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    tila,
    setTila,
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
  const { data: userPermissions } = useUserPermissions();
  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);
  const { data: hakutavat } = useHakutavat();
  const { translateEntity } = useTranslations();

  const { data: haut } = useSuspenseQuery({
    queryKey: ['getHaut'],
    queryFn: () => getHaut(userPermissions),
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
    tila,
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
    const tilat = tila ? [tila] : [Tila.JULKAISTU, Tila.ARKISTOITU];

    const { orderBy, direction } = getSortParts(sort);

    const filtered = haut.filter(
      (haku: Haku) =>
        tilat.includes(haku.tila) &&
        translateEntity(haku.nimi)
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() ?? '') &&
        alkamisKausiMatchesSelected(
          haku,
          alkamiskaudet.find((k) => k.value === selectedAlkamisKausi),
        ) &&
        haku.hakutapaKoodiUri.startsWith(selectedHakutapa ?? ''),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [
    haut,
    searchPhrase,
    tila,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
    sort,
    translateEntity,
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
