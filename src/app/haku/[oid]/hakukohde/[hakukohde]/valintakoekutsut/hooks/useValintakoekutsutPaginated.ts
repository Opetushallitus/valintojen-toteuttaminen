import { useMemo } from 'react';
import { parseAsBoolean, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { byProp, getSortParts } from '@/components/table/table-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ValintakoeKutsuItem } from '@/lib/types/valintakoekutsut-types';
import { uncapitalize } from 'remeda';
import { DEFAULT_NUQS_OPTIONS } from '@/lib/constants';
import {
  usePaginationParams,
  useResetPages,
} from '@/hooks/usePaginationParams';

export const ryhmittelyParser = parseAsStringLiteral([
  'kokeittain',
  'hakijoittain',
]);

type Ryhmittely = 'kokeittain' | 'hakijoittain';

export const useValintakoekutsutGlobalSearchParams = () => {
  const [{ ryhmittely, vainKutsuttavat }, setSearchParams] = useQueryStates(
    {
      ryhmittely: ryhmittelyParser.withDefault('kokeittain'),
      vainKutsuttavat: parseAsBoolean.withDefault(true),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: { vainKutsuttavat: 'vain-kutsuttavat' },
    },
  );

  const { pageSize, setPageSize } = usePaginationParams();

  // Hakuehdon muutos palauttaa kaikkien valintakoekutsutaulukoiden sivutuksen ensimmäiselle sivulle
  const resetPages = useResetPages();

  return {
    ryhmittely,
    setRyhmittely: (value: Ryhmittely | null) => {
      setSearchParams({ ryhmittely: value });
      resetPages();
    },
    vainKutsuttavat,
    setVainKutsuttavat: (value: boolean) => {
      setSearchParams({ vainKutsuttavat: value });
      resetPages();
    },
    pageSize,
    setPageSize,
  };
};

export const makePaginationId = (value: string) => {
  return uncapitalize(
    value
      .replace(/[\s-]+/g, '-')
      .replace(/[,.:]/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''),
  );
};

export const useValintakoekutsutPaginated = <
  T extends Pick<
    ValintakoeKutsuItem,
    'hakemusOid' | 'hakijaOid' | 'hakijanNimi'
  >,
>(
  paginationPrefix: string,
  valintakoeKutsut: Array<T>,
) => {
  const { translateEntity } = useTranslations();

  const { page, setPage, pageSize, setPageSize, sort, setSort } =
    usePaginationParams({ tableId: makePaginationId(paginationPrefix) });

  const { vainKutsuttavat, setVainKutsuttavat, ryhmittely, setRyhmittely } =
    useValintakoekutsutGlobalSearchParams();

  const results = useMemo(() => {
    const { orderBy, direction } = getSortParts(sort);
    return orderBy && direction
      ? valintakoeKutsut.sort(byProp(orderBy, direction, translateEntity))
      : valintakoeKutsut;
  }, [valintakoeKutsut, sort, translateEntity]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    sort,
    setSort,
    vainKutsuttavat,
    setVainKutsuttavat,
    ryhmittely,
    setRyhmittely,
  };
};
