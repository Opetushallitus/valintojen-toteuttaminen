import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getVisibleTabs } from './hakukohde-tab-utils';
import { Haku, Hakukohde, Tila } from '@/app/lib/types/kouta-types';
import { toFinnishDate } from '@/app/lib/time-utils';
import { UserPermissions } from '@/app/lib/permissions';

const HAKU_BASE: Haku = {
  oid: '5.4.3.2.1',
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
  hakuOid: '5.4.3.2.1',
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
  tarjoajaOid: '6.6.7',
  opetuskielet: new Set(['fi']),
};

const PERMISSIONS_BASE: UserPermissions = {
  admin: true,
  readOrganizations: [],
  writeOrganizations: [],
  crudOrganizations: [],
};

describe('getVisibleTabs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(
      toFinnishDate(new Date(Date.parse('2020-01-01T12:00:00.000Z'))),
    );
  });
  test('returns right tabs for "korkeakoulutus"', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
      },
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: { sijoittelu: true },
      usesValintalaskenta: true,
      permissions: PERMISSIONS_BASE,
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
      usesValintalaskenta: true,
      permissions: PERMISSIONS_BASE,
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
      usesValintalaskenta: true,
      permissions: PERMISSIONS_BASE,
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
    { hakutapa: 'hakutapa_02' },
    { hakutapa: 'hakutapa_03' },
    { hakutapa: 'hakutapa_04' },
    { hakutapa: 'hakutapa_05' },
    { hakutapa: 'hakutapa_06' },
  ])(
    'returns right tabs for korkeakoulutus with "$hakutapa" without sijoittelu and without valintalaskenta',
    async ({ hakutapa }: { hakutapa: string }) => {
      const tabs = getVisibleTabs({
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
          hakutapaKoodiUri: `${hakutapa}#1`,
        },
        hakukohde: HAKUKOHDE_BASE,
        haunAsetukset: { sijoittelu: false },
        usesValintalaskenta: false,
        permissions: PERMISSIONS_BASE,
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

  test.each([
    { hakutapa: 'hakutapa_02' },
    { hakutapa: 'hakutapa_03' },
    { hakutapa: 'hakutapa_04' },
    { hakutapa: 'hakutapa_05' },
    { hakutapa: 'hakutapa_06' },
  ])(
    'returns right tabs for korkeakoulutus with "$hakutapa" without sijoittelu and with valintalaskenta',
    async ({ hakutapa }: { hakutapa: string }) => {
      const tabs = getVisibleTabs({
        haku: {
          ...HAKU_BASE,
          kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
          hakutapaKoodiUri: `${hakutapa}#1`,
        },
        hakukohde: HAKUKOHDE_BASE,
        haunAsetukset: { sijoittelu: false },
        usesValintalaskenta: true,
        permissions: PERMISSIONS_BASE,
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
    },
  );

  test('only show perustiedot-tab, if not admin and use of valinnat disallowed via ohjausparametrit', async () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
        PH_OLVVPKE: {
          dateStart: Date.parse('2021-01-01T12:00:00.000Z'),
          dateEnd: Date.parse('2021-01-02T12:00:00.000Z'),
        },
      },
      usesValintalaskenta: true,
      permissions: { ...PERMISSIONS_BASE, admin: false },
    });
    expect(tabs.map((t) => t.route)).toEqual(['perustiedot']);
  });
});
