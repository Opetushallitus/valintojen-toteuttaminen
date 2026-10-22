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
  pageParam: string;
  changes: Array<Change>;
};

const searchPhraseChange: Change = {
  setter: 'setSearchPhrase',
  key: 'searchPhrase',
  values: ['abc', 'abcde'],
};

const HOOK_CASES: Array<HookCase> = [
  {
    name: 'useHakuSearchParams',
    useHook: useHakuSearchParams,
    pageParam: 'page',
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
    pageParam: 'page',
    changes: [searchPhraseChange],
  },
  {
    name: 'useJonoTuloksetSearchParams',
    useHook: () => useJonoTuloksetSearchParams('jono-1'),
    pageParam: 'page-jono-1',
    changes: [searchPhraseChange],
  },
  {
    name: 'useSijoittelunTulosSearchParams',
    useHook: () => useSijoittelunTulosSearchParams('jono-1'),
    pageParam: 'page-jono-1',
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
    useHook: () => useHakijaryhmatSearchParams('ryhma-1'),
    pageParam: 'page-ryhma-1',
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
    pageParam: 'page',
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
    pageParam: 'page',
    changes: [
      searchPhraseChange,
      {
        setter: 'setValittukoe',
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
    pageParam: 'page-harkinnanvaraiset',
    changes: [searchPhraseChange],
  },
];

// Hakuehdon muutos ja sivun nollaus pitää tehdä samalla nuqs-päivityksellä. Erillinen päivitys heti perään
// (esim. sivun nollaus effectissä) saa nuqsin hetkellisesti palauttamaan hakuehdolle vanhan arvon, jolloin
// hakukenttä ja listat välähtävät vanhalla arvolla.
describe.each(HOOK_CASES)('$name', ({ useHook, pageParam, changes }) => {
  test.each(changes)(
    '$setter does not revert to stale value and resets page',
    async ({ setter, key, values }) => {
      const { renders, current } = renderSearchParamsHook(
        useHook,
        `?${pageParam}=3`,
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
        expect(getUrlParam(pageParam)).toBeNull();
      }
    },
  );
});
