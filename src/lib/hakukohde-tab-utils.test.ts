import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getVisibleTabs } from './hakukohde-tab-utils';
import { Haku, Hakukohde, Tila } from '@/lib/kouta/kouta-types';
import { toFinnishDate } from '@/lib/time-utils';
import { UserPermissions } from '@/lib/permissions';
import { OPH_ORGANIZATION_OID } from './constants';

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
  organisaatioOid: '',
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

const OPH_PERMISSIONS: UserPermissions = {
  hasOphCRUD: true,
  readOrganizations: [OPH_ORGANIZATION_OID],
  writeOrganizations: [OPH_ORGANIZATION_OID],
  crudOrganizations: [OPH_ORGANIZATION_OID],
};

const CRUD_PERMISSIONS: UserPermissions = {
  hasOphCRUD: false,
  readOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
  writeOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
  crudOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
};

const WRITE_PERMISSIONS: UserPermissions = {
  hasOphCRUD: false,
  readOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
  writeOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
  crudOrganizations: [],
};

const READ_PERMISSIONS: UserPermissions = {
  hasOphCRUD: false,
  readOrganizations: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('OPH permissions - korkeakoulutus', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
      },
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: { sijoittelu: true },
      usesValintalaskenta: true,
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('OPH permissions - "toisen asteen yhteishaku" and harkinnanvarainen hakukohde', async () => {
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
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('OPH permissions - "toisen asteen yhteishaku" and NOT harkinnanvarainen hakukohde', async () => {
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
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('OPH permissions - korkeakoulutus without sijoittelu and without valintalaskenta', () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
      },
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: { sijoittelu: false },
      usesValintalaskenta: false,
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-tulokset',
    ]);
  });

  test('OPH permissions - korkeakoulutus without sijoittelu and with valintalaskenta', async () => {
    const tabs = getVisibleTabs({
      haku: {
        ...HAKU_BASE,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_12#1', // Korkeakoulutus
      },
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: { sijoittelu: false },
      usesValintalaskenta: true,
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('OPH permissions - use of valinnat disallowed via ohjausparametrit', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
        valinnatEstettyOppilaitosvirkailijoilta: {
          dateStart: Date.parse('2021-01-01T12:00:00.000Z'),
          dateEnd: Date.parse('2021-01-02T12:00:00.000Z'),
        },
      },
      usesValintalaskenta: true,
      permissions: OPH_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
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

  test('CRUD permissions - use of valinnat disallowed via ohjausparametrit', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
        valinnatEstettyOppilaitosvirkailijoilta: {
          dateStart: Date.parse('2021-01-01T12:00:00.000Z'),
          dateEnd: Date.parse('2021-01-02T12:00:00.000Z'),
        },
      },
      usesValintalaskenta: true,
      permissions: CRUD_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual(['perustiedot']);
  });

  test('Read permissions, no valintalaskenta and no sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: false,
      },
      usesValintalaskenta: false,
      permissions: READ_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-tulokset',
    ]);
  });

  test('Read permissions, using valintalaskenta and sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
      },
      usesValintalaskenta: true,
      permissions: READ_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valintakoekutsut',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });

  test('Write permissions, using valintalaskenta and sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
      },
      usesValintalaskenta: true,
      permissions: READ_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valintakoekutsut',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });

  test('CRUD permissions, using valintalaskenta and sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: true,
      },
      usesValintalaskenta: true,
      permissions: READ_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valintakoekutsut',
      'valintalaskennan-tulokset',
      'sijoittelun-tulokset',
    ]);
  });

  test('Write permissions - no laskenta and no sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: false,
      },
      usesValintalaskenta: false,
      permissions: WRITE_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-tulokset',
    ]);
  });

  test('CRUD permissions - no laskenta and no sijoittelu', () => {
    const tabs = getVisibleTabs({
      haku: HAKU_BASE,
      hakukohde: HAKUKOHDE_BASE,
      haunAsetukset: {
        sijoittelu: false,
      },
      usesValintalaskenta: false,
      permissions: WRITE_PERMISSIONS,
      organizationOidPath: [HAKUKOHDE_BASE.tarjoajaOid],
    });
    expect(tabs.map((t) => t.route)).toEqual([
      'perustiedot',
      'hakeneet',
      'valinnan-tulokset',
    ]);
  });
});
