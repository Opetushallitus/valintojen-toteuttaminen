import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
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
import { HakijaryhmanHakija } from '@/lib/types/laskenta-types';
import { hakemusFilter } from '@/lib/filters';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';

export const useHakijaryhmatSearchParams = (hakijaryhmaOid?: string) => {
  // Kaikki URL-parametrit samassa useQueryStatesissa, jotta hakuehdon muutos ja sivun nollaus päivittyvät
  // URL:iin yhdellä päivityksellä
  const [
    {
      searchPhrase,
      kuuluuRyhmaan,
      hyvaksyttyRyhmasta,
      sijoittelunTila,
      page,
      pageSize,
    },
    setSearchParams,
  ] = useQueryStates(
    {
      searchPhrase: parseAsString.withDefault(''),
      kuuluuRyhmaan: parseAsString.withDefault(''),
      hyvaksyttyRyhmasta: parseAsString.withDefault(''),
      sijoittelunTila: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        searchPhrase: 'search',
        kuuluuRyhmaan: 'kuuluu',
        hyvaksyttyRyhmasta: 'hyvaksytty',
        sijoittelunTila: 'tila',
        page: `page-${hakijaryhmaOid}`,
        pageSize: 'page_size',
      },
    },
  );

  const [sort, setSort] = useState<string>('');

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
    setSort,
    kuuluuRyhmaan,
    setKuuluuRyhmaan: (value: string) =>
      setSearchParams({ kuuluuRyhmaan: value, page: 1 }),
    hyvaksyttyRyhmasta,
    setHyvaksyttyRyhmasta: (value: string) =>
      setSearchParams({ hyvaksyttyRyhmasta: value, page: 1 }),
    sijoittelunTila,
    setSijoittelunTila: (value: string) =>
      setSearchParams({ sijoittelunTila: value, page: 1 }),
  };
};

export const useHakijaryhmatSearch = (
  hakijaryhmaOid: string,
  hakijaryhmanHakijat: Array<HakijaryhmanHakija>,
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
    kuuluuRyhmaan,
    hyvaksyttyRyhmasta,
    sijoittelunTila,
  } = useHakijaryhmatSearchParams(hakijaryhmaOid);

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
