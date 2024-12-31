import { expect, test, describe } from 'vitest';
import { getOpetuskieliCode } from './kouta';
import { Hakukohde } from './types/kouta-types';

describe('Kouta: getOpetuskieliCode hakukohteelle', () => {
  test('returns null as code if hakukohde has none', async () => {
    expect(
      getOpetuskieliCode({ opetuskielet: new Set() } as Hakukohde),
    ).toBeNull();
  });

  test('returns fi as a code', async () => {
    expect(
      getOpetuskieliCode({
        opetuskielet: new Set(['en', 'sv', 'fi']),
      } as Hakukohde),
    ).toBe('fi');
  });

  test('returns sv as a code when fi is missing', async () => {
    expect(
      getOpetuskieliCode({ opetuskielet: new Set(['en', 'sv']) } as Hakukohde),
    ).toBe('sv');
  });

  test('returns en as code when fi and sv are missing', async () => {
    expect(
      getOpetuskieliCode({ opetuskielet: new Set(['en']) } as Hakukohde),
    ).toBe('en');
  });
});
