import { describe, expect, test } from 'vitest';
import { getVisibleTabs } from './hakukohde-tab-utils';
import { Haku, Hakukohde, Tila } from '@/app/lib/types/kouta-types';

const HAKU_BASE: Haku = {
  oid: '1.2.3.4.5',
  nimi: {
    fi: 'testihaku',
  },
  tila: Tila.JULKAISTU,
  alkamisVuosi: 2024,
  alkamisKausiKoodiUri: 'kausi_k#1',
  hakutapaKoodiUri: '',
  hakukohteita: 123,
  kohdejoukkoKoodiUri: '',
};

const HAKUKOHDE_BASE: Hakukohde = {
  oid: '1.2.3.4.5',
  nimi: {
    fi: 'testihaku',
  },
  organisaatioOid: '6.6.6.6',
  organisaatioNimi: {
    fi: 'testiorganisaatio',
  },
  jarjestyspaikkaHierarkiaNimi: {
    fi: 'testi-järjestypaikkahierarkia-nimi',
  },
  voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
};

describe('getVisibleTabs', () => {
  test('returns right tabs for "korkeakoulutus"', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
      },
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: { sijoittelu: true },
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-hallinta',
      'valintakoekutsut',
      'pistesyotto',
      'hakijaryhmat',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });
  test('returns right tabs for "toisen asteen yhteishaku" and harkinnanvarainen hakukohde', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        hakutapaKoodiUri: 'hakutapa_01#1', // Yhteishaku
        kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1', // Perusopetuksen jälkeisen koulutuksen yhteishaku
      },
      hakukohde: {
        ...HAKUKOHDE_BASE,
        voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: true,
      },
      haunAsetukset: { sijoittelu: true },
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-hallinta',
      'valintakoekutsut',
      'pistesyotto',
      'harkinnanvaraiset',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });

  test('returns right tabs for "toisen asteen yhteishaku" and NOT harkinnanvarainen hakukohde', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        hakutapaKoodiUri: 'hakutapa_01#1', // Yhteishaku
        kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1', // Perusopetuksen jälkeisen koulutuksen yhteishaku
      },
      hakukohde: {
        ...HAKUKOHDE_BASE,
        voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
      },
      haunAsetukset: { sijoittelu: true },
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-hallinta',
      'valintakoekutsut',
      'pistesyotto',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });

  test.each([
    'hakutapa_02',
    'hakutapa_03',
    'hakutapa_04',
    'hakutapa_05',
    'hakutapa_06',
  ])(
    'returns right tabs for korkeakoulutus with "%s" and sijoittelu not used',
    async (hakutapa: string) => {
      const tabs = getVisibleTabs({
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
          hakutapaKoodiUri: `${hakutapa}#1`,
        },
        hakukohde: HAKUKOHDE_BASE,
        haunAsetukset: { sijoittelu: false },
      });
      expect(tabs.map((t) => t.route)).toEqual([
        'perustiedot',
        'hakeneet',
        'valinnan-hallinta',
        'valintakoekutsut',
        'pistesyotto',
        'valinnan-tulokset',
      ]);
    },
  );
});
