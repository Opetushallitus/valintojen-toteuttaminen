'use client';
import { useEffect, useMemo } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { getHakemukset } from '../lib/ataru';
import { hakemusFilter } from './filters';

export const useHakeneetSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'hakeneetSearch',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
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

  const searchPhraseChanged = useHasChanged(searchPhrase);

  useEffect(() => {
    if (searchPhraseChanged) {
      setPage(1);
    }
  }, [searchPhraseChanged, setPage]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  };
};

export const useHakeneetSearchResults = (
  hakuOid: string,
  hakukohdeOid: string,
) => {
  const { translateEntity } = useTranslations();

  const { data: hakeneet } = useSuspenseQuery({
    queryKey: ['getHakemukset', hakuOid, hakukohdeOid],
    queryFn: () => getHakemukset({ hakuOid, hakukohdeOid }),
  });

  const { searchPhrase, page, setPage, pageSize, setPageSize, sort, setSort } =
    useHakeneetSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakeneet.filter((h) => hakemusFilter(h, searchPhrase));
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [hakeneet, searchPhrase, sort, translateEntity]);

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
