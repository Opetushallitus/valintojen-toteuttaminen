'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type Valintaryhma = {
  name: string;
  oid: string;
};

export const getValintaryhma = async (
  hakukohdeOid: string,
): Promise<Valintaryhma> => {
  const response = await client.get(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valintaryhma`,
  );
  return { name: response.data.nimi, oid: response.data.oid };
};
