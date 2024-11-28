'use client';

import { indexBy, prop } from 'remeda';
import { getHakemukset } from './ataru';
import { configuration } from './configuration';
import { client } from './http-client';
import {
  IlmoittautumisTila,
  SijoitteluajonTulokset,
  SijoitteluajonTuloksetValintatiedoilla,
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemus,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  ValintatapajonoTulos,
  VastaanottoTila,
} from './types/sijoittelu-types';
import { MaksunTila, Maksuvelvollisuus } from './types/ataru-types';
import { FetchError, OphApiError } from './common';
import { ValinnanTulosUpdateErrorResult } from './types/valinta-tulos-types';

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
    tasasijasaanto: 'YLITAYTTO' | 'ARVONTA' | 'ALITAYTTO';
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
    hyvaksyttyHarkinnanvaraisesti: boolean;
  }>;
  valintaesitys: Array<{
    hakukohdeOid: string;
    valintatapajonoOid: string;
    hyvaksytty?: string;
  }>;
  lastModified: string;
  sijoittelunTulokset: Omit<SijoitteluajonTuloksetResponseData, 'hakijaryhmat'>;
  kirjeLahetetty: [
    {
      henkiloOid: string;
      kirjeLahetetty: string;
    },
  ];
  lukuvuosimaksut: Array<{ personOid: string; maksuntila: MaksunTila }>;
};

const getLatestSijoitteluAjonTuloksetWithValintaEsitys = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTuloksetValintatiedoilla> => {
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
  const lahetetytKirjeetIndexed = indexBy(
    data.kirjeLahetetty,
    (k) => k.henkiloOid,
  );

  const sijoitteluajonTulokset: Array<SijoitteluajonValintatapajonoValintatiedoilla> =
    data.sijoittelunTulokset.valintatapajonot.map((jono) => {
      const valintatuloksetIndexed = indexBy(
        data.valintatulokset.filter((vt) => vt.valintatapajonoOid === jono.oid),
        (vt) => vt.hakemusOid,
      );
      const hakemukset: Array<SijoittelunHakemusValintatiedoilla> =
        jono.hakemukset.map((h) => {
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
            ilmoittautumisTila: valintatulos.ilmoittautumistila,
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
            hyvaksyttyHarkinnanvaraisesti:
              valintatulos.hyvaksyttyHarkinnanvaraisesti,
            hyvaksyPeruuntunut: valintatulos.hyvaksyPeruuntunut,
            hyvaksymiskirjeLahetetty:
              lahetetytKirjeetIndexed[h.hakijaOid]?.kirjeLahetetty,
          };
        });
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

const nullWhen404 = async <T>(promise: Promise<T>): Promise<T | null> => {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof FetchError && e?.response?.status === 404) {
      console.error('FetchError with 404', e);
      return null;
    }
    throw e;
  }
};

export const tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTuloksetValintatiedoilla | null> => {
  return nullWhen404(
    getLatestSijoitteluAjonTuloksetWithValintaEsitys(hakuOid, hakukohdeOid),
  );
};

export const getLatestSijoitteluAjonTuloksetForHakukohde = async (
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

type SijoittelunHakutoiveenValintatapajonoModel = {
  tila: SijoittelunTila;
  pisteet: number;
  valintatapajonoOid: string;
  varasijanNumero: number;
  jonosija: number;
  tasasijaJonosija: number;
  valintatapajonoPrioriteetti: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
  ilmoittautumisTila: string;
};

export type SijoitteluajonTulosHakutoiveModel = {
  hakutoive: number;
  hakukohdeOid: string;
  vastaanottotieto: VastaanottoTila;
  hakijaryhmat: Array<{ oid: string; kiintio: number }>;
  hakutoiveenValintatapajonot: Array<SijoittelunHakutoiveenValintatapajonoModel>;
};

type SijoitteluajonTuloksetForHakemusResponseData = {
  hakutoiveet: Array<SijoitteluajonTulosHakutoiveModel>;
};

export const getLatestSijoitteluajonTuloksetForHakemus = async ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const res = await nullWhen404(
    client.get<SijoitteluajonTuloksetForHakemusResponseData>(
      configuration.hakemuksenSijoitteluajonTuloksetUrl({
        hakuOid,
        hakemusOid,
      }),
    ),
  );

  return res ? indexBy(res.data.hakutoiveet, prop('hakukohdeOid')) : {};
};

export const saveMaksunTilanMuutokset = async (
  hakukohdeOid: string,
  hakemukset: SijoittelunHakemusValintatiedoilla[],
  originalHakemukset: SijoittelunHakemusValintatiedoilla[],
) => {
  const hakemuksetWithChangedMaksunTila = hakemukset
    .filter((h) => {
      const original = originalHakemukset.find(
        (o) => o.hakemusOid === h.hakemusOid,
      );
      return original?.maksuntila !== h.maksuntila;
    })
    .map((h) => ({ personOid: h.hakijaOid, maksuntila: h.maksuntila }));

  if (hakemuksetWithChangedMaksunTila.length > 0) {
    await client.post(
      `${configuration.valintaTulosServiceUrl}lukuvuosimaksu/${hakukohdeOid}`,
      hakemuksetWithChangedMaksunTila,
    );
  }
};

export type ValinnanTulosModel = {
  hakukohdeOid: string;
  valintatapajonoOid: string;
  hakemusOid: string;
  henkiloOid: string;
  vastaanottotila: VastaanottoTila;
  valinnantila: SijoittelunTila;
  ilmoittautumistila: IlmoittautumisTila;
  julkaistavissa: boolean;
  ehdollisestiHyvaksyttavissa: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string | null;
  ehdollisenHyvaksymisenEhtoFI?: string | null;
  ehdollisenHyvaksymisenEhtoSV?: string | null;
  ehdollisenHyvaksymisenEhtoEN?: string | null;
  hyvaksyttyVarasijalta: boolean;
  hyvaksyPeruuntunut: boolean;
};

export const saveValinnanTulokset = async ({
  valintatapajonoOid,
  lastModified,
  tulokset,
}: {
  valintatapajonoOid: string;
  lastModified: Date | string | null;
  tulokset: Array<ValinnanTulosModel>;
}) => {
  const ifUnmodifiedSince = (
    lastModified ? new Date(lastModified) : new Date()
  ).toUTCString();

  const results = await client.patch<Array<ValinnanTulosUpdateErrorResult>>(
    configuration.valinnanTulosMuokkausUrl({ valintatapajonoOid }),
    tulokset,
    {
      headers: { 'X-If-Unmodified-Since': ifUnmodifiedSince },
    },
  );

  const { data } = results;

  if (Array.isArray(data) && data.length > 0) {
    throw new OphApiError<Array<ValinnanTulosUpdateErrorResult>>(
      results,
      'virhe.tallennus',
    );
  }

  return data;
};

export const saveSijoitteluAjonTulokset = async (
  valintatapajonoOid: string,
  hakukohdeOid: string,
  lastModified: string,
  hakemukset: SijoittelunHakemusValintatiedoilla[],
) => {
  const valintaTulokset = hakemukset.map((h) => {
    return {
      hakukohdeOid,
      valintatapajonoOid,
      hakemusOid: h.hakemusOid,
      henkiloOid: h.hakijaOid,
      vastaanottotila: h.vastaanottotila,
      ilmoittautumistila: h.ilmoittautumisTila,
      valinnantila: h.tila,
      julkaistavissa: h.julkaistavissa,
      ehdollisestiHyvaksyttavissa: h.ehdollisestiHyvaksyttavissa,
      ehdollisenHyvaksymisenEhtoKoodi: h.ehdollisenHyvaksymisenEhtoKoodi,
      ehdollisenHyvaksymisenEhtoFI: h.ehdollisenHyvaksymisenEhtoFI,
      ehdollisenHyvaksymisenEhtoSV: h.ehdollisenHyvaksymisenEhtoSV,
      ehdollisenHyvaksymisenEhtoEN: h.ehdollisenHyvaksymisenEhtoEN,
      hyvaksyttyVarasijalta: h.hyvaksyttyVarasijalta,
      hyvaksyPeruuntunut: h.hyvaksyPeruuntunut,
    };
  });

  await saveValinnanTulokset({
    valintatapajonoOid,
    lastModified: lastModified,
    tulokset: valintaTulokset,
  });

  const muuttuneetKirjeet = hakemukset.map((h) => {
    return {
      henkiloOid: h.hakijaOid,
      hakukohdeOid: hakukohdeOid,
      lahetetty: h.hyvaksymiskirjeLahetetty ?? null,
    };
  });
  await client.post<unknown>(
    `${configuration.valintaTulosServiceUrl}hyvaksymiskirje`,
    muuttuneetKirjeet,
  );
};

export const hyvaksyValintaEsitys = async (valintatapajonoOid: string) => {
  await client.post(
    `${configuration.valintaTulosServiceUrl}valintaesitys/${valintatapajonoOid}/hyvaksytty`,
    {},
  );
};

export const getValinnanTulokset = async ({
  hakemusOid,
}: {
  hakemusOid: string;
}) => {
  const { data, headers } = await client.get<
    Array<{ valinnantulos: ValinnanTulosModel }>
  >(configuration.hakemuksenValinnanTulosUrl({ hakemusOid }));
  return {
    lastModified: headers.get('X-Last-Modified'),
    data: indexBy(data.map(prop('valinnantulos')), prop('hakukohdeOid')),
  };
};
