import { describe, expect, test } from 'vitest';
import { Haku, Tila } from '@/lib/kouta/kouta-types';
import { VastaanottoTila } from '@/lib/types/sijoittelu-types';
import {
  getVastaanottoTilaLabel,
  getSelectableVastaanottoTilat,
  getVastaanottoTilaLabelKey,
} from './useVastaanottoTilaOptions';
import { TFunction } from '@/lib/localization/useTranslations';

const HAKU_BASE: Haku = {
  oid: 'haku-oid',
  nimi: { fi: 'Haku' },
  tila: Tila.JULKAISTU,
  hakutapaKoodiUri: 'hakutapa_01',
  hakukohteita: 1,
  kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1',
  organisaatioOid: 'organisaatio-oid',
};

describe('getSelectableVastaanottoTilat', () => {
  test('returns toisen asteen yhteishaku statuses for non-rekisterinpitäjä', () => {
    expect(
      getSelectableVastaanottoTilat({
        haku: HAKU_BASE,
        isRekisterinpitaja: false,
      }),
    ).toEqual([
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
      VastaanottoTila.PERUNUT,
    ]);
  });

  test('allows peruutettu for rekisterinpitäjä in toisen asteen yhteishaku', () => {
    expect(
      getSelectableVastaanottoTilat({
        haku: HAKU_BASE,
        isRekisterinpitaja: true,
      }),
    ).toEqual([
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
      VastaanottoTila.PERUNUT,
      VastaanottoTila.PERUUTETTU,
    ]);
  });

  test('keeps korkeakouluhaku statuses unchanged', () => {
    expect(
      getSelectableVastaanottoTilat({
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1',
        },
      }),
    ).toEqual([
      VastaanottoTila.KESKEN,
      VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
      VastaanottoTila.PERUNUT,
      VastaanottoTila.PERUUTETTU,
      VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
    ]);
  });

  test('keeps other haku statuses unchanged', () => {
    expect(
      getSelectableVastaanottoTilat({
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_13#1',
        },
      }),
    ).toEqual([
      VastaanottoTila.KESKEN,
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
      VastaanottoTila.PERUNUT,
      VastaanottoTila.PERUUTETTU,
    ]);
  });
});

describe('getVastaanottoTilaLabelKey', () => {
  test('uses toisen asteen label for vastaanottanut', () => {
    expect(
      getVastaanottoTilaLabelKey({
        tila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        haku: HAKU_BASE,
      }),
    ).toBe('vastaanottotila.VASTAANOTTANUT');
  });

  test('uses default label for korkeakouluhaku vastaanottanut sitovasti', () => {
    expect(
      getVastaanottoTilaLabelKey({
        tila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1',
        },
      }),
    ).toBe('vastaanottotila.VASTAANOTTANUT_SITOVASTI');
  });
});

describe('getVastaanottoTilaLabel', () => {
  test('uses default value for toisen asteen vastaanottanut when localization key is missing', () => {
    const t = ((_key: string, params?: { defaultValue?: string }) => {
      return params?.defaultValue ?? _key;
    }) as TFunction;

    expect(
      getVastaanottoTilaLabel({
        tila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        haku: HAKU_BASE,
        t,
      }),
    ).toBe('Vastaanottanut');
  });
});
