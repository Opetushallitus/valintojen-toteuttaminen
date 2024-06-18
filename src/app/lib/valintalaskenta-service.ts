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

export type JonoSijaWithHakijaInfo = JonoSija & {
  hakijanNimi: string;
  henkiloOid: string;
  pisteet?: number;
  hakutoive?: number;
};

export type LaskettuValintatapajono = {
  nimi: string;
  valintapajonooid: string;
  jonosijat: Array<JonoSija>;
};

export type LaskettuValinnanVaihe = {
  jarjestysnumero: number;
  valinnanvaiheoid: string;
  hakuOid: string;
  nimi: string;
  createdAt: number;
  valintatapajonot: Array<LaskettuValintatapajono>;
};

export const getLasketutValinnanVaiheet = async (
  hakukohdeOid: string,
): Promise<Array<LaskettuValinnanVaihe>> => {
  const response = await client.get(
    configuration.lasketutValinnanVaiheetUrl({ hakukohdeOid }),
  );
  return response.data;
};
