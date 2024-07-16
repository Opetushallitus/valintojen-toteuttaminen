'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type Jarjestyskriteeri = {
  arvo: number;
  tila: string;
  prioriteetti: number;
  nimi: string;
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

export type JonoSijaWithHakijaInfo = Omit<
  JonoSija,
  'jarjestyskriteerit' | 'harkinnanvarainen'
> & {
  hakijanNimi: string;
  henkiloOid: string;
  pisteet?: number;
  hakutoiveNumero?: number;
};

export type LaskettuValintatapajono = {
  nimi: string;
  valintatapajonooid: string;
  jonosijat: Array<JonoSija>;
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
    `${configuration.seurantaUrl}/${loadingUrl}`,
  );
  return {
    tila: response.data.tila,
    hakukohteitaYhteensa: response.data.hakukohteitaYhteensa,
    hakukohteitaValmiina: response.data.hakukohteitaValmiina,
    hakukohteitaKeskeytetty: response.data.hakukohteitaKeskeytetty,
  };
};
