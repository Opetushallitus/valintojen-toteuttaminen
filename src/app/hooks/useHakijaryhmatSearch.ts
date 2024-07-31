'use client';
import { useEffect, useMemo } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { HakijaryhmanHakija } from '../lib/valintalaskenta-service';

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;

export const useHakijaryhmatSearchParams = (hakijaryhmaOid?: string) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    `search`,
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [kuuluuRyhmaan, setKuuluuRyhmaan] = useQueryState(
    'kuuluu',
    DEFAULT_NUQS_OPTIONS,
  );

  const [hyvaksyttyRyhmasta, setHyvaksyttyRyhmasta] = useQueryState(
    'hyvaksytty',
    DEFAULT_NUQS_OPTIONS,
  );

  const [sijoittelunTila, setSijoittelunTila] = useQueryState(
    'tila',
    DEFAULT_NUQS_OPTIONS,
  );

  const [page, setPage] = useQueryState<number>(
    `page-${hakijaryhmaOid}`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  const [sort, setSort] = useQueryState('sort', DEFAULT_NUQS_OPTIONS);

  const searchPhraseChanged = useHasChanged(searchPhrase);

  const kuuluuChanged = useHasChanged(kuuluuRyhmaan);

  const hyvaksyttyChanged = useHasChanged(hyvaksyttyRyhmasta);

  const tilaChanged = useHasChanged(sijoittelunTila);

  useEffect(() => {
    if (
      searchPhraseChanged ||
      kuuluuChanged ||
      hyvaksyttyChanged ||
      tilaChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    kuuluuChanged,
    setPage,
    hyvaksyttyChanged,
    tilaChanged,
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
    kuuluuRyhmaan,
    setKuuluuRyhmaan,
    hyvaksyttyRyhmasta,
    setHyvaksyttyRyhmasta,
    sijoittelunTila,
    setSijoittelunTila,
  };
};

export const useHakijaryhmatSearch = (
  hakijaryhmaOid: string,
  hakijaryhmanHakijat: HakijaryhmanHakija[],
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
    const { orderBy, direction } = getSortParts(sort);

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
        (hakija.hakijanNimi
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() ?? '') ||
          hakija.hakemusOid.includes(searchPhrase?.toLowerCase() ?? '') ||
          hakija.henkiloOid.includes(searchPhrase?.toLowerCase() ?? '')),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
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
