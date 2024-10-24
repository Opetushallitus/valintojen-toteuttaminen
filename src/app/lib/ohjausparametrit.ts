'use client';

import { configuration } from './configuration';
import { client } from './http-client';
import { HaunAsetukset } from './types/haun-asetukset';

type HaunAsetuksetResponse = {
  sijoittelu: boolean;
  PH_VEH?: { date?: string };
};

export const getHaunAsetukset = async (
  hakuOid: string,
): Promise<HaunAsetukset> => {
  const response = await client.get<HaunAsetuksetResponse>(
    `${configuration.ohjausparametritUrl}/${hakuOid}`,
  );
  const valintaEsityksenHyvaksyminen = response.data.PH_VEH?.date
    ? new Date(response.data.PH_VEH?.date)
    : undefined;
  return { sijoittelu: response.data.sijoittelu, valintaEsityksenHyvaksyminen };
};
