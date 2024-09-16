import { expect, test } from 'vitest';
import { isNotPartOfThisHakukohde } from './pistesyotto-utils';
import { ValintakoeOsallistuminen } from '@/app/lib/types/laskenta-types';

test('is not part of the current hakukohde', () => {
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.EI_KUTSUTTU,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.TOISELLA_HAKEMUKSELLA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.TOISESSA_HAKUTOIVEESSA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
});

test('is part of the current hakukohde', () => {
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.MERKITSEMATTA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.OSALLISTUI,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.EI_OSALLISTUNUT,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminen.EI_VAADITA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
});
