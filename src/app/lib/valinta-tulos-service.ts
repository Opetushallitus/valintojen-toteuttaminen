'use client';

import { indexBy } from 'remeda';
import { getHakemukset } from './ataru';
import { configuration } from './configuration';
import { client } from './http-client';
import {
  IlmoittautumisTila,
  SijoitteluajonTulokset,
  SijoitteluajonTuloksetEnriched,
  SijoitteluajonValintatapajonoEnriched,
  SijoittelunHakemus,
  SijoittelunHakemusEnriched,
  SijoittelunTila,
  ValintatapajonoTulos,
  VastaanottoTila,
} from './types/sijoittelu-types';
import { MaksunTila, Maksuvelvollisuus } from './types/ataru-types';

type SijoittelunTulosResponseData = {
  valintatapajonoNimi: string;
  valintatapajonoOid: string;
  sijoittelunKayttamatAloituspaikat: number;
  aloituspaikat: number;
  hyvaksytyt: number;
  ehdollisestiVastaanottaneet: number;
  paikanVastaanottaneet: number;
  varasijoilla: number;
  alinHyvaksyttyPistemaara: number;
  ehdollisestiHyvaksytyt: number;
  peruneet: number;
  harkinnanvaraisestiHyvaksytty: number;
};

export const getSijoittelunTulokset = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<ValintatapajonoTulos[]> => {
  const response = await client.get<Array<SijoittelunTulosResponseData>>(
    `${configuration.valintaTulosServiceUrl}sijoitteluntulos/yhteenveto/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  const jsonTulokset: ValintatapajonoTulos[] = response.data?.map((tulos) => {
    return {
      nimi: tulos.valintatapajonoNimi,
      oid: tulos.valintatapajonoOid,
      sijoittelunAloituspaikat: `${tulos.sijoittelunKayttamatAloituspaikat}/${tulos.aloituspaikat}`,
      hyvaksytty: tulos.hyvaksytyt,
      ehdollisestiHyvaksytty: tulos.ehdollisestiHyvaksytyt,
      harkinnanvaraisestiHyvaksytty: tulos.harkinnanvaraisestiHyvaksytty,
      varasijoilla: tulos.varasijoilla,
      vastaanottaneet: tulos.paikanVastaanottaneet,
      paikanPeruneet: tulos.peruneet,
      pisteraja: tulos.alinHyvaksyttyPistemaara,
    };
  });
  return jsonTulokset;
};

type SijoitteluajonTuloksetResponseData = {
  valintatapajonot: Array<{
    oid: string;
    nimi: string;
    prioriteetti: number;
    aloituspaikat: number;
    alkuperaisetAloituspaikat?: number;
    tasasijasaanto: 'YLITAYTTO' | 'ARVONtA' | 'ALITAYTTO';
    eiVarasijatayttoa: boolean;
    hakemukset: [
      {
        hakijaOid: string;
        hakemusOid: string;
        pisteet: number;
        tila: SijoittelunTila;
        valintatapajonoOid: string;
        hyvaksyttyHakijaryhmista: string[];
        varasijanNumero: number;
        jonosija: number;
        tasasijaJonosija: number;
        prioriteetti: number;
        onkoMuuttunutViimeSijoittelussa: boolean;
      },
    ];
  }>;
  hakijaryhmat: Array<{ oid: string; kiintio: number }>;
};

type SijoitteluajonTuloksetWithValintaEsitysResponseData = {
  valintatulokset: Array<{
    valintatapajonoOid: string;
    hakemusOid: string;
    henkiloOid: string;
    pisteet: number;
    valinnantila: 'VARALLA' | 'HYLATTY' | 'HYVAKSYTTY';
    ehdollisestiHyvaksyttavissa: boolean;
    julkaistavissa: boolean;
    hyvaksyttyVarasijalta: boolean;
    hyvaksyPeruuntunut: boolean;
    hyvaksyttyHakijaryhmista: string[];
    varasijanNumero: number;
    jonosija: number;
    tasasijaJonosija: number;
    prioriteetti: number;
    vastaanottotila: VastaanottoTila;
    ilmoittautumistila: IlmoittautumisTila;
    ehdollisenHyvaksymisenEhtoKoodi?: string;
    ehdollisenHyvaksymisenEhtoFI?: string;
    ehdollisenHyvaksymisenEhtoSV?: string;
    ehdollisenHyvaksymisenEhtoEN?: string;
    vastaanottoDeadlineMennyt?: boolean;
    vastaanottoDeadline?: string;
  }>;
  hakijaryhmat: Array<{ oid: string; kiintio: number }>;
  valintaesitys: Array<{
    hakukohdeOid: string;
    valintatapajonoOid: string;
    hyvaksytty: string;
  }>;
  lastModified: string;
  sijoittelunTulokset: Omit<SijoitteluajonTuloksetResponseData, 'hakijaryhmat'>;
  lukuvuosimaksut: Array<{ personOid: string; maksuntila: MaksunTila }>;
};

const showVastaanottoTieto = (hakemuksenTila: SijoittelunTila) =>
  [
    SijoittelunTila.HYVAKSYTTY,
    SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    SijoittelunTila.PERUNUT,
    SijoittelunTila.PERUUTETTU,
  ].includes(hakemuksenTila);

export const getLatestSijoitteluAjonTuloksetWithValintaEsitys = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTuloksetEnriched> => {
  const { data } =
    await client.get<SijoitteluajonTuloksetWithValintaEsitysResponseData>(
      `${configuration.valintaTulosServiceUrl}sijoitteluntulos/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
    );
  const hakemukset = await getHakemukset({ hakuOid, hakukohdeOid });
  const hakemuksetIndexed = indexBy(hakemukset, (h) => h.hakemusOid);
  const lukuvuosimaksutIndexed = indexBy(
    data.lukuvuosimaksut,
    (m) => m.personOid,
  );
  const valintatuloksetIndexed = indexBy(
    data.valintatulokset,
    (vt) => vt.hakemusOid,
  );
  const sijoitteluajonTulokset: Array<SijoitteluajonValintatapajonoEnriched> =
    data.sijoittelunTulokset.valintatapajonot.map((jono) => {
      const hakemukset: Array<SijoittelunHakemusEnriched> = jono.hakemukset.map(
        (h) => {
          const hakemus = hakemuksetIndexed[h.hakemusOid];
          const valintatulos = valintatuloksetIndexed[h.hakemusOid];
          const maksuntila =
            hakemus.maksuvelvollisuus === Maksuvelvollisuus.MAKSUVELVOLLINEN &&
            (lukuvuosimaksutIndexed[h.hakijaOid]?.maksuntila ??
              MaksunTila.MAKSAMATTA);
          return {
            hakijaOid: h.hakijaOid,
            hakemusOid: h.hakemusOid,
            hakijanNimi: hakemus?.hakijanNimi,
            pisteet: h.pisteet,
            tila: h.tila,
            valintatapajonoOid: h.valintatapajonoOid,
            hyvaksyttyHakijaryhmista: h.hyvaksyttyHakijaryhmista,
            varasijanNumero: h.varasijanNumero,
            jonosija: h.jonosija,
            tasasijaJonosija: h.tasasijaJonosija,
            hakutoive: h.prioriteetti,
            ilmoittautumisTila:
              valintatuloksetIndexed[h.hakemusOid].ilmoittautumistila,
            julkaistavissa: valintatulos.julkaistavissa,
            vastaanottotila: valintatulos.vastaanottotila,
            maksuntila: maksuntila || undefined,
            ehdollisestiHyvaksyttavissa:
              valintatulos.ehdollisestiHyvaksyttavissa,
            hyvaksyttyVarasijalta: valintatulos.hyvaksyttyVarasijalta,
            onkoMuuttunutViimeSijoittelussa: h.onkoMuuttunutViimeSijoittelussa,
            ehdollisenHyvaksymisenEhtoKoodi:
              valintatulos.ehdollisenHyvaksymisenEhtoKoodi,
            ehdollisenHyvaksymisenEhtoFI:
              valintatulos.ehdollisenHyvaksymisenEhtoFI,
            ehdollisenHyvaksymisenEhtoSV:
              valintatulos.ehdollisenHyvaksymisenEhtoSV,
            ehdollisenHyvaksymisenEhtoEN:
              valintatulos.ehdollisenHyvaksymisenEhtoEN,
            vastaanottoDeadlineMennyt: valintatulos.vastaanottoDeadlineMennyt,
            vastaanottoDeadline: valintatulos.vastaanottoDeadline,
            naytetaanVastaanottoTieto: showVastaanottoTieto(h.tila),
          };
        },
      );
      hakemukset.sort((a, b) =>
        a.jonosija === b.jonosija
          ? a.tasasijaJonosija - b.tasasijaJonosija
          : a.jonosija - b.jonosija,
      );
      hakemukset
        .filter(function (hakemus) {
          return (
            hakemus.tila === 'HYVAKSYTTY' ||
            hakemus.tila === 'VARASIJALTA_HYVAKSYTTY' ||
            hakemus.tila === 'VARALLA'
          );
        })
        .forEach((hakemus, i) => (hakemus.sija = i + 1));
      return {
        oid: jono.oid,
        nimi: jono.nimi,
        hakemukset,
        prioriteetti: jono.prioriteetti,
        accepted: data.valintaesitys?.find(
          (e) => e.valintatapajonoOid === jono.oid,
        )?.hyvaksytty,
        varasijataytto: !jono.eiVarasijatayttoa,
        aloituspaikat: jono.aloituspaikat,
        alkuperaisetAloituspaikat: jono.alkuperaisetAloituspaikat,
        tasasijasaanto: jono.tasasijasaanto,
      };
    });
  return {
    valintatapajonot: sijoitteluajonTulokset,
    lastModified: data.lastModified,
  };
};

export const getLatestSijoitteluAjonTulokset = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTulokset> => {
  const { data } = await client.get<SijoitteluajonTuloksetResponseData>(
    `${configuration.valintaTulosServiceUrl}sijoittelu/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
  );

  const sijoitteluajonTulokset = data.valintatapajonot.map((jono) => {
    const hakemukset: Array<SijoittelunHakemus> = jono.hakemukset.map((h) => {
      return {
        hakijaOid: h.hakijaOid,
        hakemusOid: h.hakemusOid,
        pisteet: h.pisteet,
        tila: h.tila,
        valintatapajonoOid: h.valintatapajonoOid,
        hyvaksyttyHakijaryhmista: h.hyvaksyttyHakijaryhmista,
        varasijanNumero: h.varasijanNumero,
      };
    });
    return {
      oid: jono.oid,
      nimi: jono.nimi,
      hakemukset,
      prioriteetti: jono.prioriteetti,
    };
  });
  const hakijaryhmat = data.hakijaryhmat.map((ryhma) => {
    return { oid: ryhma.oid, kiintio: ryhma.kiintio };
  });
  return { valintatapajonot: sijoitteluajonTulokset, hakijaryhmat };
};
