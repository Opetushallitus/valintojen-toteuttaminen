'use client';

import { configuration } from './configuration';
import { client } from './http-client';
import {
  SijoitteluajonTulokset,
  SijoittelunHakemus,
  SijoittelunTila,
  ValintatapajonoTulos,
} from './types/sijoittelu-types';

export const getSijoittelunTulokset = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<ValintatapajonoTulos[]> => {
  const response = await client.get(
    `${configuration.valintaTulosServiceUrl}sijoitteluntulos/yhteenveto/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  const jsonTulokset: ValintatapajonoTulos[] = response.data?.map(
    (tulos: {
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
    }) => {
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
    },
  );
  return jsonTulokset;
};

export const getLatestSijoitteluAjonTulokset = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTulokset> => {
  const { data } = await client.get(
    `${configuration.valintaTulosServiceUrl}sijoittelu/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
  );
  const sijoitteluajonTulokset = data.valintatapajonot.map(
    (jono: {
      oid: string;
      nimi: string;
      prioriteetti: number;
      hakemukset: [
        {
          hakijaOid: string;
          hakemusOid: string;
          pisteet: number;
          tila: SijoittelunTila;
          valintatapajonoOid: string;
          hyvaksyttyHakijaryhmista: string[];
          varasijanNumero: number;
        },
      ];
    }) => {
      const hakemukset: SijoittelunHakemus[] = jono.hakemukset.map((h) => {
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
    },
  );
  const hakijaryhmat = data.hakijaryhmat.map(
    (ryhma: { oid: string; kiintio: number }) => {
      return { oid: ryhma.oid, kiintio: ryhma.kiintio };
    },
  );
  return { valintatapajonot: sijoitteluajonTulokset, hakijaryhmat };
};
