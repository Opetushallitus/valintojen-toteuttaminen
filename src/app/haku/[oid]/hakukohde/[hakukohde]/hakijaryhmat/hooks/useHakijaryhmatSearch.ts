import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsString, useQueryStates } from 'nuqs';
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
import { HakijaryhmanHakija } from '@/lib/types/laskenta-types';
import { hakemusFilter } from '@/lib/filters';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';

/**
 * Kaikille hakijaryhmille yhteiset hakuehdot ja sivukoko. Sivu ja järjestys ovat hakijaryhmäkohtaisia
 * (ks. usePaginationParams). Hakuehdon muutos palauttaa kaikkien hakijaryhmien sivutuksen ensimmäiselle sivulle.
 */
export const useHakijaryhmatSearchParams = () => {
  const [
    { searchPhrase, kuuluuRyhmaan, hyvaksyttyRyhmasta, sijoittelunTila },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      kuuluuRyhmaan: parseAsString.withDefault(''),
      hyvaksyttyRyhmasta: parseAsString.withDefault(''),
      sijoittelunTila: parseAsString.withDefault(''),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'search',
        kuuluuRyhmaan: 'kuuluu',
        hyvaksyttyRyhmasta: 'hyvaksytty',
        sijoittelunTila: 'tila',
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
    kuuluuRyhmaan,
    setKuuluuRyhmaan: (value: string) =>
      setSearchParamsAndResetPages({ kuuluuRyhmaan: value }),
    hyvaksyttyRyhmasta,
    setHyvaksyttyRyhmasta: (value: string) =>
      setSearchParamsAndResetPages({ hyvaksyttyRyhmasta: value }),
    sijoittelunTila,
    setSijoittelunTila: (value: string) =>
      setSearchParamsAndResetPages({ sijoittelunTila: value }),
  };
};

export const useHakijaryhmatSearch = (
  hakijaryhmaOid: string,
  hakijaryhmanHakijat: Array<HakijaryhmanHakija>,
) => {
  const { translateEntity } = useTranslations();

  const { searchPhrase, kuuluuRyhmaan, hyvaksyttyRyhmasta, sijoittelunTila } =
    useHakijaryhmatSearchParams();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    usePaginationParams({ tableId: hakijaryhmaOid });

  const results = useMemo(() => {
    const parsedKuuluuRyhmaan: boolean | null =
      kuuluuRyhmaan.length > 0 ? JSON.parse(kuuluuRyhmaan) : null;
    const parsedHyvaksytty: boolean | null =
      hyvaksyttyRyhmasta.length > 0 ? JSON.parse(hyvaksyttyRyhmasta) : null;

    const filtered = hakijaryhmanHakijat.filter(
      (hakija) =>
        (parsedKuuluuRyhmaan == null ||
          hakija.kuuluuHakijaryhmaan === parsedKuuluuRyhmaan) &&
        (parsedHyvaksytty == null ||
          hakija.hyvaksyttyHakijaryhmasta === parsedHyvaksytty) &&
        (sijoittelunTila.length < 1 ||
          hakija.sijoittelunTila === sijoittelunTila) &&
        hakemusFilter(hakija, searchPhrase),
    );

    const sortHakijat = (orderBy: string, direction: SortDirection) => {
      if (orderBy === 'sijoittelunTila') {
        return sortByValinnanTila(direction, filtered);
      }
      return filtered.sort(byProp(orderBy, direction, translateEntity));
    };

    const { orderBy, direction } = getSortParts(sort);

    return orderBy && direction ? sortHakijat(orderBy, direction) : filtered;
  }, [
    hakijaryhmanHakijat,
    searchPhrase,
    sort,
    translateEntity,
    kuuluuRyhmaan,
    hyvaksyttyRyhmasta,
    sijoittelunTila,
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
