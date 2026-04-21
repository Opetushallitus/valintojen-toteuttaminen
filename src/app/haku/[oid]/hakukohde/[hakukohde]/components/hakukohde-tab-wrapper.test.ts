import { describe, expect, test } from 'vitest';
import { isHakukohdeTabReadOnly } from './hakukohde-tab-wrapper';
import { Haku, Tila } from '@/lib/kouta/kouta-types';

const HAKU_BASE: Haku = {
  oid: '1.2.246.562.29.00000000000000021303',
  nimi: { fi: 'Testihaku' },
  tila: Tila.JULKAISTU,
  alkamisVuosi: 2025,
  alkamisKausiKoodiUri: 'kausi_k#1',
  hakutapaKoodiUri: '',
  hakukohteita: 1,
  kohdejoukkoKoodiUri: '',
  organisaatioOid: '',
};

describe('isHakukohdeTabReadOnly', () => {
  test('returns false for non-OPH write user on valintalaskennan tulokset when valintalaskenta is not used', () => {
    expect(
      isHakukohdeTabReadOnly({
        activeTabRoute: 'valintalaskennan-tulokset',
        haku: {
          ...HAKU_BASE,
          hakutapaKoodiUri: 'hakutapa_01#1',
          kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1',
        },
        hasOnlyRead: false,
        hasOphCRUD: false,
        usesValintalaskenta: false,
      }),
    ).toBe(false);
  });

  test('returns true for non-OPH write user on valintalaskennan tulokset when valintalaskenta is used in toisen asteen yhteishaku', () => {
    expect(
      isHakukohdeTabReadOnly({
        activeTabRoute: 'valintalaskennan-tulokset',
        haku: {
          ...HAKU_BASE,
          hakutapaKoodiUri: 'hakutapa_01#1',
          kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1',
        },
        hasOnlyRead: false,
        hasOphCRUD: false,
        usesValintalaskenta: true,
      }),
    ).toBe(true);
  });

  test('returns true for read-only user regardless of valintalaskenta usage', () => {
    expect(
      isHakukohdeTabReadOnly({
        activeTabRoute: 'valintalaskennan-tulokset',
        haku: HAKU_BASE,
        hasOnlyRead: true,
        hasOphCRUD: false,
        usesValintalaskenta: false,
      }),
    ).toBe(true);
  });
});
