'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type HaunAsetukset = {
  sijoittelu: boolean;
  // PH_OLVVPKE: "Oppilaitosten virkailijoiden valintapalvelun käyttö estetty"
  PH_OLVVPKE?: {
    dateStart: number;
    dateEnd: number;
  };
};

export const getHaunAsetukset = async (
  hakuOid: string,
): Promise<HaunAsetukset> => {
  const response = await client.get<HaunAsetukset>(
    `${configuration.ohjausparametritUrl}/${hakuOid}`,
  );
  return response.data;
};
