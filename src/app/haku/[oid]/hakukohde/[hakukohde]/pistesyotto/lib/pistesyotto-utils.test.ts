import { expect, test } from 'vitest';
import { isNotPartOfThisHakukohde } from './pistesyotto-utils';
import { ValintakoeOsallistuminenTulos } from '@/lib/types/laskenta-types';

test('is not part of the current hakukohde', () => {
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.EI_KUTSUTTU,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.TOISELLA_HAKEMUKSELLA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.TOISESSA_HAKUTOIVEESSA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeTruthy();
});

test('is part of the current hakukohde', () => {
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.MERKITSEMATTA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
  expect(
    isNotPartOfThisHakukohde({
      osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
      tunniste: 'koe-1',
      osallistuminenTunniste: 'koe-1-osallistuminen',
      arvo: '',
    }),
  ).toBeFalsy();
});
