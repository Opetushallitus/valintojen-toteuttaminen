'use client';
import { useEffect, useMemo } from 'react';
import {
  Haku,
  HaunAlkaminen,
  Tila,
  getHakuAlkamisKaudet,
} from '../lib/kouta/kouta-types';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChangedForQueryState } from '@/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import { getHaut } from '../lib/kouta/kouta-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useHakutavat } from '../lib/koodisto/useHakutavat';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { useUserPermissions } from './useUserPermissions';
import { TranslatedName } from '../lib/localization/localization-types';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { isBefore, isValid } from 'date-fns';

const alkamisKausiMatchesSelected = (
  haku: Haku,
  selectedAlkamisKausi?: HaunAlkaminen,
): boolean =>
  !selectedAlkamisKausi ||
  Boolean(
    haku.alkamisVuosi === selectedAlkamisKausi?.alkamisVuosi &&
      haku.alkamisKausiKoodiUri?.startsWith(
        selectedAlkamisKausi.alkamisKausiKoodiUri,
      ),
  );

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

const getKausiVuosiTranslation = (
  kausiUri: string | undefined,
  vuosi: number,
) => {
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

  const tilachanged = useHasChangedForQueryState(tila);
  const searchPhraseChanged = useHasChangedForQueryState(searchPhrase);
  const selectedAlkamisKausiChanged =
    useHasChangedForQueryState(selectedAlkamisKausi);
  const selectedHakutapaChanged = useHasChangedForQueryState(selectedHakutapa);

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
  const userPermissions = useUserPermissions();
  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);
  const { data: hakutavat } = useHakutavat();
  const { t, translateEntity } = useTranslations();

  const { data: haut } = useSuspenseQuery({
    queryKey: ['getHaut', userPermissions],
    queryFn: () => getHaut(userPermissions),
    select: (data) =>
      data.map((haku) => {
        let vuosi: string | undefined;
        let kausiKoodi: string | undefined;
        let kausiNimi: TranslatedName | undefined;
        let alkamiskausiTimestamp: string | undefined = ''; // Taulukon järjestämistä varten

        const koulutuksenAlkamiskausi = haku.koulutuksenAlkamiskausi;

        if (koulutuksenAlkamiskausi) {
          if (
            koulutuksenAlkamiskausi.alkamiskausityyppi ===
            'alkamiskausi ja -vuosi'
          ) {
            vuosi = koulutuksenAlkamiskausi.koulutuksenAlkamisvuosi;
            kausiKoodi =
              koulutuksenAlkamiskausi.koulutuksenAlkamiskausi.koodiUri;
            alkamiskausiTimestamp = `${vuosi}${
              kausiKoodi === 'kausi_k' ? '-01-01T00:00' : '-08-01T00:00'
            }`;

            kausiNimi = getKausiVuosiTranslation(kausiKoodi, parseInt(vuosi));
          } else if (
            koulutuksenAlkamiskausi.alkamiskausityyppi ===
            'tarkka alkamisajankohta'
          ) {
            const alkamiskausiDate = new Date(
              koulutuksenAlkamiskausi.koulutuksenAlkamispaivamaara,
            );
            if (isValid(alkamiskausiDate)) {
              alkamiskausiTimestamp = toFormattedDateTimeString(
                alkamiskausiDate,
                "yyyy-MM-dd'T'HH:mm",
              );
              vuosi = alkamiskausiDate.getFullYear().toString();
              kausiKoodi = isBefore(
                alkamiskausiDate,
                new Date(`${vuosi}-08-01T00:00`),
              )
                ? 'kausi_k'
                : 'kausi_s';
              const nimi = toFormattedDateTimeString(
                alkamiskausiDate,
                'd.M.yyyy',
              );
              kausiNimi = { fi: nimi, sv: nimi, en: nimi };
            }
          } else if (
            koulutuksenAlkamiskausi.alkamiskausityyppi ===
            'henkilokohtainen suunnitelma'
          ) {
            alkamiskausiTimestamp = 'henkilokohtainen';
            kausiNimi = {
              fi: t('haku.alkamiskausi-henkilokohtainen-suunnitelma', {
                language: 'fi',
              }),
              sv: t('haku.alkamiskausi-henkilokohtainen-suunnitelma', {
                language: 'sv',
              }),
              en: t('haku.alkamiskausi-henkilokohtainen-suunnitelma', {
                language: 'en',
              }),
            };
          }
        }

        return {
          ...haku,
          hakutapaNimi: hakutavat.find(
            (hakutapa) => hakutapa.koodiUri === haku.hakutapaKoodiUri,
          )?.nimi,
          alkamisKausiKoodiUri: kausiKoodi,
          alkamiskausiTimestamp,
          alkamisVuosi: vuosi ? parseInt(vuosi) : undefined,
          alkamiskausiNimi: kausiNimi,
        };
      }),
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

    if (orderBy === 'alkamiskausiNimi') {
      return filtered.sort((a, b) => {
        const aValue = a.alkamiskausiTimestamp ?? '';
        const bValue = b.alkamiskausiTimestamp ?? '';

        switch (true) {
          case aValue === 'henkilokohtainen' && bValue !== '':
            return 1;
          case bValue === 'henkilokohtainen' && aValue !== '':
            return -1;
          case aValue === '':
            return 1;
          case bValue === '':
            return -1;
          case aValue > bValue:
            return direction === 'asc' ? 1 : -1;
          case aValue < bValue:
            return direction === 'asc' ? -1 : 1;
          default:
            return 0;
        }
      });
    }

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
