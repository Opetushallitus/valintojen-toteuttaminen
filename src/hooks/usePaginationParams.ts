import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useOptimisticSearchParams } from 'nuqs/adapters/react-router/v8';
import { unique } from 'remeda';
import { DEFAULT_NUQS_OPTIONS, DEFAULT_PAGE_SIZE } from '@/lib/constants';

const PAGE_PARAM = 'page';

// Taulukkokohtaiset sivuparametrit (page-<taulukon tunniste>). Huom! Pelkkä "page"-etuliite osuisi myös page_size-parametriin.
const TABLE_PAGE_PARAM_PREFIX = `${PAGE_PARAM}-`;

const isPageParam = (key: string) =>
  key === PAGE_PARAM || key.startsWith(TABLE_PAGE_PARAM_PREFIX);

/**
 * Palauttaa funktion, joka palauttaa kaikkien taulukoiden sivutuksen ensimmäiselle sivulle poistamalla URL:sta kaikki
 * sivuparametrit. Ensimmäinen sivu on oletusarvo, joten sitä ei ole URL:ssa.
 * Kutsu synkronisesti samassa funktiossa hakuehdon päivityksen kanssa, jotta nuqs päivittää molemmat URL:iin
 * yhdellä päivityksellä. Erillinen päivitys (esim. effectissä) saa nuqsin palauttamaan hakuehdolle hetkellisesti
 * vanhan arvon.
 */
export const useResetPages = () => {
  const searchParams = useOptimisticSearchParams();
  const pageParamKeys = unique(Array.from(searchParams.keys())).filter(
    isPageParam,
  );

  const [, setPages] = useQueryStates(
    Object.fromEntries(
      pageParamKeys.map((key) => [key, parseAsInteger.withDefault(1)]),
    ),
    DEFAULT_NUQS_OPTIONS,
  );

  return () =>
    setPages(Object.fromEntries(pageParamKeys.map((key) => [key, null])));
};

/**
 * Taulukon sivu, sivukoko ja järjestys URL-parametreina. Näkymissä, joissa on useita taulukoita (esim. yksi per
 * valintatapajono), sivu ja järjestys ovat taulukkokohtaisia (tableId). Sivukoko on kaikille taulukoille yhteinen.
 * Sivukoon muutos palauttaa kaikkien taulukoiden sivutuksen ensimmäiselle sivulle.
 */
export const usePaginationParams = ({
  tableId,
  defaultSort = '',
}: { tableId?: string; defaultSort?: string } = {}) => {
  const [{ page, pageSize, sort }, setPaginationParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
      sort: parseAsString.withDefault(defaultSort),
    },
    {
      ...DEFAULT_NUQS_OPTIONS,
      urlKeys: {
        page: tableId ? `${TABLE_PAGE_PARAM_PREFIX}${tableId}` : PAGE_PARAM,
        pageSize: 'page_size',
        sort: tableId ? `sort-${tableId}` : 'sort',
      },
    },
  );

  const resetPages = useResetPages();

  return {
    page,
    setPage: (value: number) => setPaginationParams({ page: value }),
    pageSize,
    setPageSize: (value: number) => {
      setPaginationParams({ pageSize: value });
      resetPages();
    },
    sort,
    setSort: (value: string) => setPaginationParams({ sort: value }),
  };
};
