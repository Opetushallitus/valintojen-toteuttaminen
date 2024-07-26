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

export const useHakijaryhmatSearch = (
  hakijaryhmaOid: string,
  hakijaryhmanHakijat: HakijaryhmanHakija[],
) => {
  const { translateEntity } = useTranslations();

  const { searchPhrase, page, setPage, pageSize, setPageSize, sort, setSort } =
    useHakijaryhmatSearchParams(hakijaryhmaOid);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakijaryhmanHakijat.filter(
      (hakijat) =>
        hakijat.hakijanNimi
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() ?? '') ||
        hakijat.hakemusOid.includes(searchPhrase?.toLowerCase() ?? '') ||
        hakijat.henkiloOid.includes(searchPhrase?.toLowerCase() ?? ''),
    );
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [hakijaryhmanHakijat, searchPhrase, sort, translateEntity]);

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
