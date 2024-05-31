'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type ValintatapajonoTulos = {
  nimi: string;
  oid: string;
  sijoittelunAloituspaikat: string;
  hyvaksytty: number;
  ehdollisestiHyvaksytty: number;
  harkinnanvaraisestiHyvaksytty: number;
  varasijoilla: number;
  vastaanottaneet: number;
  paikanPeruneet: number;
  pisteraja: number;
};

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
