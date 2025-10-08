import { expect, test, vi, describe, afterEach } from 'vitest';
import {
  IlmoittautumisTila,
  SijoitteluajonTuloksetValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  ValinnanTila,
  VastaanottoTila,
} from '../types/sijoittelu-types';
import { selectSijoitteluajonTuloksetValintatiedoilla } from './useSijoitteluajonTuloksetValintatiedoilla';
import { SijoitteluajonTuloksetWithValintaEsitysResponseData } from './valinta-tulos-types';
import {
  HakemuksenTila,
  Hakukelpoisuus,
  Maksuvelvollisuus,
} from '../ataru/ataru-types';

describe('selectSijoitteluajonTuloksetValintatiedoilla', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns tulokset', async () => {
    const tulokset: SijoitteluajonTuloksetValintatiedoilla | null =
      await getTuloksetValintatiedoilla();
    expect(tulokset).not.toBeNull();
    expect(tulokset!.valintatapajonot.length).toEqual(1);
    const jono = tulokset!.valintatapajonot[0]!;
    expect(jono).toBeDefined();
    expect(jono.nimi).toEqual('Todistusvalinta (YO)');
    expect(jono.aloituspaikat).toEqual(2);
    expect(jono.alkuperaisetAloituspaikat).toEqual(1);
    expect(jono.prioriteetti).toEqual(0);
    expect(jono.tasasijasaanto).toEqual('ARVONTA');
    expect(jono.varasijataytto).toBeTruthy();
    expect(jono.hakemukset.length).toEqual(3);
    assertHakemus(
      jono.hakemukset[0]!,
      2,
      'Dacula Kreivi',
      '15',
      ValinnanTila.HYVAKSYTTY,
      VastaanottoTila.KESKEN,
      IlmoittautumisTila.EI_TEHTY,
    );
    assertHakemus(
      jono.hakemukset[1]!,
      1,
      'Nukettaja Ruhtinas',
      '15',
      ValinnanTila.HYVAKSYTTY,
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      IlmoittautumisTila.LASNA,
    );
    assertHakemus(
      jono.hakemukset[2]!,
      3,
      'Purukumi Puru',
      '12',
      ValinnanTila.VARALLA,
      VastaanottoTila.KESKEN,
      IlmoittautumisTila.EI_TEHTY,
    );
  });

  test('tulokset are sorted by sija', async () => {
    const tulokset: SijoitteluajonTuloksetValintatiedoilla | null =
      await getTuloksetValintatiedoilla();
    expect(tulokset).not.toBeNull();
    const hakemukset = tulokset!.valintatapajonot?.[0]?.hakemukset;
    expect(hakemukset?.[0]?.hakemusOid).toEqual('hakemus2');
    expect(hakemukset?.[0]?.sija).toEqual(1);
    expect(hakemukset?.[1]?.hakemusOid).toEqual('hakemus1');
    expect(hakemukset?.[1]?.sija).toEqual(2);
    expect(hakemukset?.[2]?.hakemusOid).toEqual('hakemus3');
    expect(hakemukset?.[2]?.sija).toEqual(3);
  });
});

function assertHakemus(
  hakemus: SijoittelunHakemusValintatiedoilla,
  oidNumber: number,
  nimi: string,
  pisteet: string,
  tila: ValinnanTila,
  vastaanottoTila: VastaanottoTila,
  ilmoTila: IlmoittautumisTila,
) {
  expect(hakemus.hakijanNimi).toEqual(nimi);
  expect(hakemus.hakemusOid).toEqual('hakemus' + oidNumber);
  expect(hakemus.hakijaOid).toEqual('hakija' + oidNumber);
  expect(hakemus.pisteet).toEqual(pisteet);
  expect(hakemus.valintatapajonoOid).toEqual('jono1');
  expect(hakemus.valinnanTila).toEqual(tila);
  expect(hakemus.vastaanottoTila).toEqual(vastaanottoTila);
  expect(hakemus.ilmoittautumisTila).toEqual(ilmoTila);
  expect(hakemus.maksunTila).not.toBeDefined();
}

async function getTuloksetValintatiedoilla() {
  return selectSijoitteluajonTuloksetValintatiedoilla({
    hakemukset: [
      {
        tila: HakemuksenTila.AKTIIVINEN,
        asiointikieliKoodi: 'fi',
        etunimet: 'Ruhtinas',
        sukunimi: 'Nukettaja',
        hakijaOid: 'hakija1',
        hakemusOid: 'hakemus1',
        hakijanNimi: 'Nukettaja Ruhtinas',
        hakutoiveNumero: 1,
        henkilotunnus: '123456-7890',
        postinumero: '00100',
        hakukelpoisuus: Hakukelpoisuus.HAKUKELPOINEN,
        maksuvelvollisuus: Maksuvelvollisuus.EI_MAKSUVELVOLLINEN,
        lahiosoite: 'Onpahanvaankatu 2',
      },
      {
        tila: HakemuksenTila.AKTIIVINEN,
        asiointikieliKoodi: 'fi',
        etunimet: 'Kreivi',
        sukunimi: 'Dacula',
        hakijaOid: 'hakija2',
        hakemusOid: 'hakemus2',
        hakijanNimi: 'Dacula Kreivi',
        hakutoiveNumero: 2,
        henkilotunnus: '223456-7890',
        postinumero: '00100',
        hakukelpoisuus: Hakukelpoisuus.HAKUKELPOINEN,
        maksuvelvollisuus: Maksuvelvollisuus.EI_MAKSUVELVOLLINEN,
        lahiosoite: 'Onpahanvaankatu 3',
      },
      {
        tila: HakemuksenTila.AKTIIVINEN,
        asiointikieliKoodi: 'fi',
        etunimet: 'Puru',
        sukunimi: 'Purukumi',
        hakijaOid: 'hakija3',
        hakemusOid: 'hakemus3',
        hakijanNimi: 'Purukumi Puru',
        hakutoiveNumero: 3,
        henkilotunnus: '223457-7890',
        postinumero: '00100',
        hakukelpoisuus: Hakukelpoisuus.HAKUKELPOINEN,
        maksuvelvollisuus: Maksuvelvollisuus.EI_MAKSUVELVOLLINEN,
        lahiosoite: 'Onpahanvaankatu 4',
      },
    ],
    sijoittelunTulokset: (await buildDummyValinnanTulosResponse())?.data,
  });
}

function buildDummyValinnanTulosResponse() {
  const response: SijoitteluajonTuloksetWithValintaEsitysResponseData = {
    valintatulokset: [
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
      },
    ],
    valintaesitys: [
      { hakukohdeOid: 'hakukohde1', valintatapajonoOid: 'jono1' },
    ],
    lastModified: new Date().toISOString(),
    sijoittelunTulokset: {
      sijoitteluajoId: 'sijoitteluajo1',
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
              tila: ValinnanTila.HYVAKSYTTY,
              valintatapajonoOid: 'jono1',
              hyvaksyttyHakijaryhmista: [],
              varasijanNumero: 0,
              jonosija: 1,
              tasasijaJonosija: 2,
              prioriteetti: 1,
              siirtynytToisestaValintatapajonosta: false,
              onkoMuuttunutViimeSijoittelussa: false,
              hyvaksyttyHarkinnanvaraisesti: false,
            },
            {
              hakijaOid: 'hakija2',
              hakemusOid: 'hakemus2',
              pisteet: 15,
              tila: ValinnanTila.HYVAKSYTTY,
              valintatapajonoOid: 'jono1',
              hyvaksyttyHakijaryhmista: [],
              varasijanNumero: 0,
              jonosija: 1,
              tasasijaJonosija: 1,
              prioriteetti: 1,
              siirtynytToisestaValintatapajonosta: false,
              onkoMuuttunutViimeSijoittelussa: false,
              hyvaksyttyHarkinnanvaraisesti: false,
            },
            {
              hakijaOid: 'hakija3',
              hakemusOid: 'hakemus3',
              pisteet: 12,
              tila: ValinnanTila.VARALLA,
              valintatapajonoOid: 'jono1',
              hyvaksyttyHakijaryhmista: [],
              varasijanNumero: 0,
              jonosija: 3,
              tasasijaJonosija: 1,
              prioriteetti: 1,
              siirtynytToisestaValintatapajonosta: false,
              onkoMuuttunutViimeSijoittelussa: false,
              hyvaksyttyHarkinnanvaraisesti: false,
            },
          ],
        },
      ],
    },
    lukuvuosimaksut: [],
    kirjeLahetetty: [],
  };

  return Promise.resolve({
    headers: new Headers(),
    data: response,
  });
}
