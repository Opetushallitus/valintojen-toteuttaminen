'use client';
import { useMemo } from 'react';
import { Hakukohde } from '../lib/types/kouta-types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useQueryState } from 'nuqs';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  DEFAULT_NUQS_OPTIONS,
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
} from '@/app/lib/constants';
import { useTranslations } from './useTranslations';
import { getHakukohteetQueryOptions } from '../lib/kouta';
import { useUserPermissions } from './useUserPermissions';

export const useHakukohdeSearchParams = () => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'hksearch',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
  };
};

export const useHakukohdeSearchResults = (hakuOid: string) => {
  const { translateEntity } = useTranslations();
  const { data: userPermissions } = useUserPermissions();

  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  const { searchPhrase } = useHakukohdeSearchParams();

  const results = useMemo(() => {
    return hakukohteet.filter(
      (hakukohde: Hakukohde) =>
        translateEntity(hakukohde.nimi)
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() ?? '') ||
        translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)
          .toLowerCase()
          .includes(searchPhrase?.toLowerCase() || '') ||
        hakukohde.oid.includes(searchPhrase?.toLowerCase() || ''),
    );
  }, [hakukohteet, searchPhrase, translateEntity]);

  return {
    results,
  };
};
