import { expect, test, vi, describe, afterEach } from 'vitest';
import { client } from './http-client';
import {
  IlmoittautumisTila,
  SijoitteluajonTuloksetValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from './types/sijoittelu-types';
import { tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys } from './valinta-tulos-service';
import { buildDummyHakemukset } from './ataru.test';

describe('Valinta-tulos-service: tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns tulokset', async () => {
    const tulokset: SijoitteluajonTuloksetValintatiedoilla | null =
      await getTulokset();
    expect(tulokset).not.toBeNull();
    expect(tulokset!.valintatapajonot.length).toEqual(1);
    const jono = tulokset!.valintatapajonot[0];
    expect(jono.nimi).toEqual('Todistusvalinta (YO)');
    expect(jono.aloituspaikat).toEqual(2);
    expect(jono.alkuperaisetAloituspaikat).toEqual(1);
    expect(jono.prioriteetti).toEqual(0);
    expect(jono.tasasijasaanto).toEqual('ARVONTA');
    expect(jono.varasijataytto).toBeTruthy();
    expect(jono.hakemukset.length).toEqual(3);
    assertHakemus(
      jono.hakemukset[0],
      2,
      'Dacula Kreivi',
      15,
      SijoittelunTila.HYVAKSYTTY,
      VastaanottoTila.KESKEN,
      IlmoittautumisTila.EI_TEHTY,
    );
    assertHakemus(
      jono.hakemukset[1],
      1,
      'Nukettaja Ruhtinas',
      15,
      SijoittelunTila.HYVAKSYTTY,
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      IlmoittautumisTila.LASNA,
    );
    assertHakemus(
      jono.hakemukset[2],
      3,
      'Purukumi Puru',
      12,
      SijoittelunTila.VARALLA,
      VastaanottoTila.KESKEN,
      IlmoittautumisTila.EI_TEHTY,
    );
  });

  test('tulokset are sorted by sija', async () => {
    const tulokset: SijoitteluajonTuloksetValintatiedoilla | null =
      await getTulokset();
    expect(tulokset).not.toBeNull();
    const hakemukset = tulokset!.valintatapajonot[0].hakemukset;
    expect(hakemukset[0].hakemusOid).toEqual('hakemus2');
    expect(hakemukset[0].sija).toEqual(1);
    expect(hakemukset[1].hakemusOid).toEqual('hakemus1');
    expect(hakemukset[1].sija).toEqual(2);
    expect(hakemukset[2].hakemusOid).toEqual('hakemus3');
    expect(hakemukset[2].sija).toEqual(3);
  });
});

function assertHakemus(
  hakemus: SijoittelunHakemusValintatiedoilla,
  oidNumber: number,
  nimi: string,
  pisteet: number,
  tila: SijoittelunTila,
  vastaanottoTila: VastaanottoTila,
  ilmoTila: IlmoittautumisTila,
) {
  expect(hakemus.hakijanNimi).toEqual(nimi);
  expect(hakemus.hakemusOid).toEqual('hakemus' + oidNumber);
  expect(hakemus.hakijaOid).toEqual('hakija' + oidNumber);
  expect(hakemus.pisteet).toEqual(pisteet);
  expect(hakemus.valintatapajonoOid).toEqual('jono1');
  expect(hakemus.tila).toEqual(tila);
  expect(hakemus.vastaanottotila).toEqual(vastaanottoTila);
  expect(hakemus.ilmoittautumisTila).toEqual(ilmoTila);
  expect(hakemus.maksunTila).not.toBeDefined();
}

async function getTulokset() {
  const clientSpy = vi.spyOn(client, 'get');
  clientSpy
    .mockImplementationOnce(() => buildDummyValinnanTulosResponse())
    .mockImplementationOnce(() => buildDummyHakemukset());
  return await tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys(
    'haku1',
    'hakukohde1',
  );
}

function buildDummyValinnanTulosResponse() {
  const dummyValintatulokset = [
    {
      valintatapajonoOid: 'jono1',
      hakemusOid: 'hakemus1',
      henkiloOid: 'hakija1',
      pisteet: 15,
      valinnantila: 'HYVAKSYTTY',
      ehdollisestiHyvaksyttavissa: false,
      julkaistavissa: true,
      hyvaksyttyVarasijalta: false,
      hyvaksyPeruuntunut: false,
      hyvaksyttyHakijaryhmista: [],
      varasijanNumero: 0,
      jonosija: 1,
      tasasijaJonosija: 2,
      prioriteetti: 1,
      vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      ilmoittautumistila: IlmoittautumisTila.LASNA,
      hyvaksyttyHarkinnanvaraisesti: false,
    },
    {
      valintatapajonoOid: 'jono1',
      hakemusOid: 'hakemus2',
      henkiloOid: 'hakija2',
      pisteet: 15,
      valinnantila: 'HYVAKSYTTY',
      ehdollisestiHyvaksyttavissa: false,
      julkaistavissa: true,
      hyvaksyttyVarasijalta: false,
      hyvaksyPeruuntunut: false,
      hyvaksyttyHakijaryhmista: [],
      varasijanNumero: 0,
      jonosija: 1,
      tasasijaJonosija: 1,
      prioriteetti: 1,
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: IlmoittautumisTila.EI_TEHTY,
      hyvaksyttyHarkinnanvaraisesti: false,
    },
    {
      valintatapajonoOid: 'jono1',
      hakemusOid: 'hakemus3',
      henkiloOid: 'hakija3',
      pisteet: 12,
      valinnantila: 'VARALLA',
      ehdollisestiHyvaksyttavissa: false,
      julkaistavissa: true,
      hyvaksyttyVarasijalta: false,
      hyvaksyPeruuntunut: false,
      hyvaksyttyHakijaryhmista: [],
      varasijanNumero: 1,
      jonosija: 3,
      tasasijaJonosija: 1,
      prioriteetti: 1,
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: IlmoittautumisTila.EI_TEHTY,
      hyvaksyttyHarkinnanvaraisesti: false,
    },
  ];

  const dummySijoittelunTulokset = {
    valintatapajonot: [
      {
        oid: 'jono1',
        nimi: 'Todistusvalinta (YO)',
        prioriteetti: 0,
        aloituspaikat: 2,
        alkuperaisetAloituspaikat: 1,
        tasasijasaanto: 'ARVONTA',
        eiVarasijatayttoa: false,
        hakemukset: [
          {
            hakijaOid: 'hakija1',
            hakemusOid: 'hakemus1',
            pisteet: 15,
            tila: SijoittelunTila.HYVAKSYTTY,
            valintatapajonoOid: 'jono1',
            hyvaksyttyHakijaryhmista: [],
            varasijanNumero: 0,
            jonosija: 1,
            tasasijaJonosija: 2,
            prioriteetti: 1,
            onkoMuuttunutViimeSijoittelussa: false,
          },
          {
            hakijaOid: 'hakija2',
            hakemusOid: 'hakemus2',
            pisteet: 15,
            tila: SijoittelunTila.HYVAKSYTTY,
            valintatapajonoOid: 'jono1',
            hyvaksyttyHakijaryhmista: [],
            varasijanNumero: 0,
            jonosija: 1,
            tasasijaJonosija: 1,
            prioriteetti: 1,
            onkoMuuttunutViimeSijoittelussa: false,
          },
          {
            hakijaOid: 'hakija3',
            hakemusOid: 'hakemus3',
            pisteet: 12,
            tila: SijoittelunTila.VARALLA,
            valintatapajonoOid: 'jono1',
            hyvaksyttyHakijaryhmista: [],
            varasijanNumero: 0,
            jonosija: 3,
            tasasijaJonosija: 1,
            prioriteetti: 1,
            onkoMuuttunutViimeSijoittelussa: false,
          },
        ],
      },
    ],
  };

  return Promise.resolve({
    headers: new Headers(),
    data: {
      valintatulokset: dummyValintatulokset,
      valintaesitys: [
        { hakukohdeOid: 'hakukohde1', valintatapajonoOid: 'jono1' },
      ],
      lastModified: new Date().toISOString(),
      sijoittelunTulokset: dummySijoittelunTulokset,
      lukuvuosimaksut: [],
      kirjeLahetetty: [],
    },
  });
}
