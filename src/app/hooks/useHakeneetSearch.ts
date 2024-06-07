https://virkailija.untuvaopintopolku.fi/lomake-editori/api/external/valinta-ui?hakuOid=1.2.246.562.29.00000000000000021303&hakukohdeOid=1.2.246.562.20.00000000000000024798

'use client';
import { useEffect, useMemo } from 'react';
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

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;


export const useHakeneetSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'search',
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
    if (
      searchPhraseChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    setPage,
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
  };
};

export const useHakeneetSearchResults = () => {
  const { data: userPermissions } = useUserPermissions();
  const { translateEntity } = useTranslations();

  const { data: hakeneet } = useSuspenseQuery({
    queryKey: ['getHakeneet'],
    queryFn: () => getHaut(userPermissions),
  });

  const {
    searchPhrase,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
  } = useHakeneetSearchParams();

  const results = useMemo(() => {

    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakijat.filter(
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
    hakeneet,
    searchPhrase,
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
