'use client';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/hooks/useHasChanged';
import { byProp, getSortParts } from '@/components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import { hakemusFilter } from '@/lib/filters';
import { isEmpty } from 'remeda';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { sortByValinnanTila } from '@/lib/sortByValinnanTila';

const DEFAULT_PAGE_SIZE = 10;

export const useValinnanTuloksetSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'search',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [valinnanTila, setValinnanTila] = useQueryState(
    'valinnantila',
    DEFAULT_NUQS_OPTIONS,
  );

  const [vastaanottoTila, setVastaanottoTila] = useQueryState(
    'vastaanottotila',
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

  const [sort, setSort] = useState<string>('');

  const searchPhraseChanged = useHasChanged(searchPhrase);
  const valinnanTilaChanged = useHasChanged(valinnanTila);
  const vastaanottoTilaChanged = useHasChanged(vastaanottoTila);

  useEffect(() => {
    if (searchPhraseChanged || valinnanTilaChanged || vastaanottoTilaChanged) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    setPage,
    valinnanTilaChanged,
    vastaanottoTilaChanged,
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
    valinnanTila,
    setValinnanTila,
    vastaanottoTila,
    setVastaanottoTila,
  };
};

export const useValinnanTuloksetSearch = (
  hakemukset: Array<HakemuksenValinnanTulos>,
) => {
  const { translateEntity } = useTranslations();

  const {
    valinnanTila,
    vastaanottoTila,
    searchPhrase,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  } = useValinnanTuloksetSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakemukset.filter(
      (hakemus) =>
        (isEmpty(valinnanTila) || valinnanTila === hakemus?.valinnanTila) &&
        (isEmpty(vastaanottoTila) ||
          vastaanottoTila === hakemus?.vastaanottoTila) &&
        hakemusFilter(hakemus, searchPhrase),
    );

    if (orderBy === 'valinnantila') {
      return sortByValinnanTila(direction, filtered);
    }

    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [
    hakemukset,
    searchPhrase,
    sort,
    translateEntity,
    valinnanTila,
    vastaanottoTila,
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
