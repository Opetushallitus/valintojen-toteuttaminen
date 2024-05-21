'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type Valintaryhma = {
  nimi: string;
  oid: string;
};

export const getValintaryhma = async (
  hakukohdeOid: string,
): Promise<Valintaryhma> => {
  const response = await client.get(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valintaryhma`,
  );
  return { nimi: response.data.nimi, oid: response.data.oid };
};
