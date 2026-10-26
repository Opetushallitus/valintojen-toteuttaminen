import { act } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  expectNoStaleValues,
  getUrlParam,
  renderSearchParamsHook,
  waitForUrlUpdates,
} from './search-params-test-utils';
import { useHakuSearchParams } from './useHakuSearch';
import { useHakeneetSearchParams } from './useHakeneetSearch';
import { useJonoTuloksetSearchParams } from './useJonoTuloksetSearch';
import { useSijoittelunTulosSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/sijoittelun-tulokset/hooks/useSijoittelunTulosSearch';
import { useHakijaryhmatSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/hakijaryhmat/hooks/useHakijaryhmatSearch';
import { useValinnanTuloksetSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/valinnan-tulokset/hooks/useValinnanTuloksetSearch';
import { usePisteSyottoSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/pistesyotto/hooks/usePisteSyottoSearch';
import { useHarkinnanvaraisetSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/harkinnanvaraiset/hooks/useHarkinnanvaraisetSearchParams';
import { useValintakoekutsutGlobalSearchParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/valintakoekutsut/hooks/useValintakoekutsutPaginated';
import { usePaginationParams } from './usePaginationParams';

vi.mock('@/lib/constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/constants')>()),
  HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY: 0,
}));

type Change = {
  setter: string;
  key: string;
  values: [unknown, unknown];
};

type HookCase = {
  name: string;
  useHook: () => object;
  pageParams: Array<string>;
  changes: Array<Change>;
};

// Näkymissä, joissa on useita taulukoita (esim. yksi per valintatapajono), hakuehdon muutos nollaa kaikkien taulukoiden sivut
const TABLE_PAGE_PARAMS = ['page-taulukko-1', 'page-taulukko-2'];

const searchPhraseChange: Change = {
  setter: 'setSearchPhrase',
  key: 'searchPhrase',
  values: ['abc', 'abcde'],
};

const HOOK_CASES: Array<HookCase> = [
  {
    name: 'useHakuSearchParams',
    useHook: useHakuSearchParams,
    pageParams: ['page'],
    changes: [
      searchPhraseChange,
      { setter: 'setTila', key: 'tila', values: ['arkistoitu', ''] },
      {
        setter: 'setSelectedHakutapa',
        key: 'selectedHakutapa',
        values: ['hakutapa_01', 'hakutapa_02'],
      },
      {
        setter: 'setSelectedAlkamisKausi',
        key: 'selectedAlkamisKausi',
        values: ['2024_kausi_s', '2025_kausi_k'],
      },
    ],
  },
  {
    name: 'useHakeneetSearchParams',
    useHook: useHakeneetSearchParams,
    pageParams: ['page'],
    changes: [searchPhraseChange],
  },
  {
    name: 'useJonoTuloksetSearchParams',
    useHook: useJonoTuloksetSearchParams,
    pageParams: TABLE_PAGE_PARAMS,
    changes: [searchPhraseChange],
  },
  {
    name: 'useSijoittelunTulosSearchParams',
    useHook: useSijoittelunTulosSearchParams,
    pageParams: TABLE_PAGE_PARAMS,
    changes: [
      searchPhraseChange,
      {
        setter: 'setSijoittelunTila',
        key: 'sijoittelunTila',
        values: ['HYVAKSYTTY', 'VARALLA'],
      },
      {
        setter: 'setShowOnlyEhdolliset',
        key: 'showOnlyEhdolliset',
        values: [true, false],
      },
      {
        setter: 'setShowOnlyMuuttuneetViimeSijoittelussa',
        key: 'showOnlyMuuttuneetViimeSijoittelussa',
        values: [true, false],
      },
    ],
  },
  {
    name: 'useHakijaryhmatSearchParams',
    useHook: useHakijaryhmatSearchParams,
    pageParams: TABLE_PAGE_PARAMS,
    changes: [
      searchPhraseChange,
      {
        setter: 'setKuuluuRyhmaan',
        key: 'kuuluuRyhmaan',
        values: ['true', 'false'],
      },
      {
        setter: 'setHyvaksyttyRyhmasta',
        key: 'hyvaksyttyRyhmasta',
        values: ['true', 'false'],
      },
      {
        setter: 'setSijoittelunTila',
        key: 'sijoittelunTila',
        values: ['HYVAKSYTTY', 'VARALLA'],
      },
    ],
  },
  {
    name: 'useValinnanTuloksetSearchParams',
    useHook: useValinnanTuloksetSearchParams,
    pageParams: ['page'],
    changes: [
      searchPhraseChange,
      {
        setter: 'setValinnanTila',
        key: 'valinnanTila',
        values: ['HYVAKSYTTY', 'VARALLA'],
      },
      {
        setter: 'setVastaanottoTila',
        key: 'vastaanottoTila',
        values: ['KESKEN', 'VASTAANOTTANUT_SITOVASTI'],
      },
    ],
  },
  {
    name: 'usePisteSyottoSearchParams',
    useHook: usePisteSyottoSearchParams,
    pageParams: ['page'],
    changes: [
      searchPhraseChange,
      {
        setter: 'setValittuKoe',
        key: 'valittuKoe',
        values: ['koe-1', 'koe-2'],
      },
      {
        setter: 'setOsallistumisenTila',
        key: 'osallistumisenTila',
        values: ['OSALLISTUI', 'EI_OSALLISTUNUT'],
      },
      {
        setter: 'setNaytaVainLaskentaanVaikuttavat',
        key: 'naytaVainLaskentaanVaikuttavat',
        values: [false, true],
      },
    ],
  },
  {
    name: 'useHarkinnanvaraisetSearchParams',
    useHook: useHarkinnanvaraisetSearchParams,
    pageParams: ['page-harkinnanvaraiset'],
    changes: [searchPhraseChange],
  },
  {
    // Sivukoon muutos nollaa kaikkien taulukoiden sivut
    name: 'usePaginationParams',
    useHook: () => usePaginationParams({ tableId: 'taulukko-1' }),
    pageParams: ['page', ...TABLE_PAGE_PARAMS],
    changes: [{ setter: 'setPageSize', key: 'pageSize', values: [20, 30] }],
  },
  {
    name: 'useValintakoekutsutGlobalSearchParams',
    useHook: useValintakoekutsutGlobalSearchParams,
    pageParams: TABLE_PAGE_PARAMS,
    changes: [
      {
        setter: 'setVainKutsuttavat',
        key: 'vainKutsuttavat',
        values: [false, true],
      },
      {
        setter: 'setRyhmittely',
        key: 'ryhmittely',
        values: ['hakijoittain', 'kokeittain'],
      },
    ],
  },
];

// Hakuehdon muutos ja sivun nollaus pitää tehdä samalla nuqs-päivityksellä. Erillinen päivitys heti perään
// (esim. sivun nollaus effectissä) saa nuqsin hetkellisesti palauttamaan hakuehdolle vanhan arvon, jolloin
// hakukenttä ja listat välähtävät vanhalla arvolla.
describe.each(HOOK_CASES)('$name', ({ useHook, pageParams, changes }) => {
  test.each(changes)(
    '$setter does not revert to stale value and resets page',
    async ({ setter, key, values }) => {
      // page_size ei saa nollautua sivujen mukana
      const { renders, current } = renderSearchParamsHook(
        useHook,
        `?${[...pageParams.map((pageParam) => `${pageParam}=3`), 'page_size=10'].join('&')}`,
      );

      for (const value of values) {
        const rendersBeforeChange = renders.length;
        act(() => {
          (current.value as Record<string, (v: unknown) => void>)[setter]!(
            value,
          );
        });
        await waitForUrlUpdates();

        expectNoStaleValues(
          renders
            .slice(rendersBeforeChange)
            .map((r) => (r as Record<string, unknown>)[key]),
          value,
        );
        for (const pageParam of pageParams) {
          expect(getUrlParam(pageParam)).toBeNull();
        }
        expect(getUrlParam('page_size')).toBe(
          key === 'pageSize' ? String(value) : '10',
        );
      }
    },
  );
});
