import { expect, test, describe } from 'vitest';
import { getHakukohdeFullName, getOpetuskieliCode } from './kouta-service';
import { Hakukohde } from './kouta-types';
import { useTranslations } from '../localization/useTranslations';
import { NDASH } from '../constants';

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

describe('Kouta. getHakukohdeFullName', () => {
  test('returns full name with jarjestyspaikka', () => {
    const { translateEntity } = useTranslations();
    const hakukohde = {
      nimi: { fi: 'Tekniikan tohtoritutkinto 3+2' },
      jarjestyspaikkaHierarkiaNimi: { fi: 'Otaniemen kampus' },
    } as Hakukohde;
    expect(getHakukohdeFullName(hakukohde, translateEntity)).toBe(
      `Tekniikan tohtoritutkinto 3+2 ${NDASH} Otaniemen kampus`,
    );
  });

  test('returns full name with jarjestyspaikka after hakukohde name', () => {
    const { translateEntity } = useTranslations();
    const hakukohde = {
      nimi: { fi: 'Tekniikan tohtoritutkinto 3+2' },
      jarjestyspaikkaHierarkiaNimi: { fi: 'Otaniemen kampus' },
    } as Hakukohde;
    expect(getHakukohdeFullName(hakukohde, translateEntity, true)).toBe(
      'Otaniemen kampus, Tekniikan tohtoritutkinto 3+2',
    );
  });
});
