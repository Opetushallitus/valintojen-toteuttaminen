'use client';
import { useEffect, useMemo } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { byProp, getSortParts } from '../components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { LaskennanJonosijaTulosWithHakijaInfo } from './useEditableValintalaskennanTulokset';
import { hakemusFilter } from '../lib/filters';

const DEFAULT_PAGE_SIZE = 10;

export const useJonoTuloksetSearchParams = (id?: string) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    `search`,
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [page, setPage] = useQueryState<number>(
    `page-${id}`,
    parseAsInteger.withOptions(DEFAULT_NUQS_OPTIONS).withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withOptions(DEFAULT_NUQS_OPTIONS)
      .withDefault(DEFAULT_PAGE_SIZE),
  );

  const [sort, setSort] = useQueryState(`sort-${id}`, DEFAULT_NUQS_OPTIONS);

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

export const useJonoTuloksetSearch = (
  jonoId: string,
  jonoTulos: Array<LaskennanJonosijaTulosWithHakijaInfo>,
) => {
  const { translateEntity } = useTranslations();

  const { searchPhrase, page, setPage, pageSize, setPageSize, sort, setSort } =
    useJonoTuloksetSearchParams(jonoId);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = jonoTulos.filter((j) => hakemusFilter(j, searchPhrase));

    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, translateEntity))
      : filtered;
  }, [jonoTulos, searchPhrase, sort, translateEntity]);

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
