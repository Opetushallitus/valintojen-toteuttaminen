'use client';

import { LaskettuJonoWithHakijaInfo } from '../hooks/useLasketutValinnanVaiheet';
import { booleanToString } from './common';
import { configuration } from './configuration';
import { client } from './http-client';

export type Jarjestyskriteeri = {
  arvo: number;
  tila: string;
  prioriteetti: number;
  nimi: string;
  kuvaus?: {
    FI?: string;
    SV?: string;
    EN?: string;
  };
};

export type JonoSija = {
  jonosija: number;
  hakemusOid: string;
  hakijaOid: string;
  tuloksenTila: string;
  harkinnanvarainen: boolean;
  prioriteetti: number;
  jarjestyskriteerit: Array<Jarjestyskriteeri>;
};

export type LaskettuValintatapajono = {
  oid: string;
  nimi: string;
  valintatapajonooid: string;
  prioriteetti: number;
  jonosijat: Array<JonoSija>;
  valmisSijoiteltavaksi: boolean;
  siirretaanSijoitteluun: boolean;
};

export type LaskettuValinnanVaihe = {
  jarjestysnumero: number;
  valinnanvaiheoid: string;
  hakuOid: string;
  nimi: string;
  createdAt: number;
  valintatapajonot?: Array<LaskettuValintatapajono>;
};

export type SeurantaTiedot = {
  tila: 'VALMIS' | 'MENEILLAAN';
  hakukohteitaYhteensa: number;
  hakukohteitaValmiina: number;
  hakukohteitaKeskeytetty: number;
};

export const getLasketutValinnanVaiheet = async (
  hakukohdeOid: string,
): Promise<Array<LaskettuValinnanVaihe>> => {
  const response = await client.get(
    configuration.lasketutValinnanVaiheetUrl({ hakukohdeOid }),
  );
  return response.data;
};

export const getLaskennanSeurantaTiedot = async (
  loadingUrl: string,
): Promise<SeurantaTiedot> => {
  const response = await client.get(
    `${configuration.seurantaUrl}${loadingUrl}`,
  );
  return {
    tila: response.data.tila,
    hakukohteitaYhteensa: response.data.hakukohteitaYhteensa,
    hakukohteitaValmiina: response.data.hakukohteitaValmiina,
    hakukohteitaKeskeytetty: response.data.hakukohteitaKeskeytetty,
  };
};

export type MuutaSijoitteluaResponse = {
  prioriteetti: number;
  [x: string]: string | number | boolean | null;
};

export const muutaSijoittelunStatus = async ({
  jono,
  status,
}: {
  jono: Pick<LaskettuJonoWithHakijaInfo, 'oid' | 'prioriteetti'>;
  status: boolean;
}): Promise<Array<MuutaSijoitteluaResponse>> => {
  const valintatapajonoOid = jono.oid;

  const { data: updatedJono } = await client.post(
    // Miksi samat parametrit välitetään sekä URL:ssä että bodyssa?
    configuration.automaattinenSiirtoUrl({ valintatapajonoOid, status }),
    {
      valintatapajonoOid,
      status: booleanToString(status),
    },
    {
      cache: 'no-cache',
    },
  );

  if (updatedJono.prioriteetti === -1) {
    // A query for a single jono doesn't return a true prioriteetti value, but -1 as a placeholder, so let's re-set the value
    updatedJono.prioriteetti = jono.prioriteetti;
  }

  const { data } = await client.put(
    configuration.valmisSijoiteltavaksiUrl({ valintatapajonoOid, status }),
    updatedJono,
    {
      cache: 'no-cache',
    },
  );

  return data;
};
