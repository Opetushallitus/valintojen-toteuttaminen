'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type ValintatapajonoTulos = {
  nimi: string;
  oid: string;
  sijoittelunAloituspaikat: number;
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
  try {
    const response = await client.get(
      `${configuration.valintaTulosServiceUrl}sijoitteluntulos/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
    );
    const jsonTulokset: ValintatapajonoTulos[] =
      response.data?.sijoittelunTulokset?.valintatapajonot?.map(
        (jono: { nimi: string; oid: string }) => {
          return {
            nimi: jono.nimi,
            oid: jono.oid,
            sijoittelunAloituspaikat: 100,
            hyvaksytty: 40,
            ehdollisestiHyvaksytty: 5,
            harkinnanvaraisestiHyvaksytty: 5,
            varasijoilla: 255,
            vastaanottaneet: 5,
            paikanPeruneet: 10,
            pisteraja: 8.5,
          };
        },
      );
    return jsonTulokset;
  } catch (error) {
    if (error?.response?.status == 404) {
      return [];
    } else {
      throw error;
    }
  }
};
