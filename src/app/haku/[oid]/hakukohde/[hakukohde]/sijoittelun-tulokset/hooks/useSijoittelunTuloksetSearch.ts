'use client';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import {
  byProp,
  getSortParts,
  SortDirection,
} from '@/app/components/table/table-utils';
import { HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusEnriched,
  SijoittelunTila,
  SijoittelunTilaOrdinals,
} from '@/app/lib/types/sijoittelu-types';
import { hakemusFilter } from '@/app/hooks/filters';
import { DEFAULT_NUQS_OPTIONS } from '@/app/hooks/common';

const DEFAULT_PAGE_SIZE = 10;

export const useSijoittelunTulosSearchParams = (
  valintatapajonoOid?: string,
) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    `search`,
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(
    setSearchPhrase,
    HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY,
  );

  const [sijoittelunTila, setSijoittelunTila] = useQueryState(
    'tila',
    DEFAULT_NUQS_OPTIONS,
  );

  const [page, setPage] = useQueryState<number>(
    `page-${valintatapajonoOid}`,
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

  const tilaChanged = useHasChanged(sijoittelunTila);

  useEffect(() => {
    if (searchPhraseChanged || tilaChanged) {
      setPage(1);
    }
  }, [searchPhraseChanged, setPage, tilaChanged]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    sijoittelunTila,
    setSijoittelunTila,
  };
};

export const useSijoittelunTulosSearch = (
  valintatapajonoOid: string,
  hakemukset: SijoittelunHakemusEnriched[],
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
    sijoittelunTila,
  } = useSijoittelunTulosSearchParams(valintatapajonoOid);

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);

    const filtered = hakemukset.filter(
      (hakemus) =>
        (sijoittelunTila.length < 1 || hakemus.tila === sijoittelunTila) &&
        hakemusFilter(hakemus, searchPhrase),
    );

    const sortHakijat = (orderBy: string, direction: SortDirection) => {
      if (orderBy === 'sijoittelunTila') {
        const asc = direction === 'asc';
        return filtered.sort((a, b) => {
          if (a.tila && b.tila) {
            const aOrdinal = SijoittelunTilaOrdinals[a.tila];
            const bOrdinal = SijoittelunTilaOrdinals[b.tila];
            if (
              aOrdinal === bOrdinal &&
              aOrdinal === SijoittelunTilaOrdinals[SijoittelunTila.VARALLA] &&
              a.varasijanNumero &&
              b.varasijanNumero
            ) {
              return a.varasijanNumero > b.varasijanNumero
                ? asc
                  ? 1
                  : -1
                : b.varasijanNumero > a.varasijanNumero
                  ? asc
                    ? -1
                    : 1
                  : 0;
            }
            return aOrdinal > bOrdinal
              ? asc
                ? 1
                : -1
              : bOrdinal > aOrdinal
                ? asc
                  ? -1
                  : 1
                : 0;
          }
          return a.tila ? (asc ? 1 : -1) : b.tila ? (asc ? -1 : 1) : 0;
        });
      }
      return filtered.sort(byProp(orderBy, direction, translateEntity));
    };

    return orderBy && direction ? sortHakijat(orderBy, direction) : filtered;
  }, [hakemukset, searchPhrase, sort, translateEntity, sijoittelunTila]);

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