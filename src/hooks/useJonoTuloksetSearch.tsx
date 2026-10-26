import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseAsString, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '../components/table/table-utils';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/lib/constants';
import { useTranslations } from '../lib/localization/useTranslations';
import { LaskennanJonosijaTulosWithHakijaInfo } from './useEditableValintalaskennanTulokset';
import { hakemusFilter } from '../lib/filters';
import { usePaginationParams, useResetPages } from './usePaginationParams';

/**
 * Kaikille valintatapajonoille yhteinen hakutermi ja sivukoko. Sivu ja järjestys ovat jonokohtaisia
 * (ks. usePaginationParams). Hakutermin muutos palauttaa kaikkien jonojen sivutuksen ensimmäiselle sivulle.
 */
export const useJonoTuloksetSearchParams = () => {
  const [{ searchPhrase }, setSearchParams] = useQueryStates(
    { searchPhrase: parseAsString.withDefault('') },
    { ...DEFAULT_NUQS_OPTIONS, urlKeys: { searchPhrase: 'search' } },
  );

  const { pageSize, setPageSize } = usePaginationParams();

  const resetPages = useResetPages();

  const setSearchDebounce = useDebounce((value: string) => {
    setSearchParams({ searchPhrase: value });
    resetPages();
  }, HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    pageSize,
    setPageSize,
  };
};

export const useJonoTuloksetSearch = (
  jonoId: string,
  jonoTulos: Array<LaskennanJonosijaTulosWithHakijaInfo>,
) => {
  const { translateEntity } = useTranslations();

  const { searchPhrase } = useJonoTuloksetSearchParams();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    usePaginationParams({ tableId: jonoId });

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
