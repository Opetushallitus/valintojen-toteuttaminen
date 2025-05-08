'use client';

import { getConfiguration } from '@/hooks/useConfiguration';
import { client } from '../http-client';
import { HaunAsetukset } from './ohjausparametrit-types';

type HaunAsetuksetResponse = {
  sijoittelu: boolean;
  // PH_OLVVPKE: "Oppilaitosten virkailijoiden valintapalvelun käyttö estetty"
  PH_OLVVPKE?: {
    dateStart: number;
    dateEnd: number;
  };
  PH_VEH?: { date?: string };
};

export const getHaunAsetukset = async (
  hakuOid: string,
): Promise<HaunAsetukset> => {
  const configuration = await getConfiguration();
  const response = await client.get<HaunAsetuksetResponse>(
    `${configuration.ohjausparametritUrl}/${hakuOid}`,
  );
  const valintaEsityksenHyvaksyminen = response.data.PH_VEH?.date
    ? new Date(response.data.PH_VEH?.date)
    : undefined;
  return {
    sijoittelu: response.data.sijoittelu,
    PH_OLVVPKE: response.data.PH_OLVVPKE,
    valintaEsityksenHyvaksyminen,
  };
};
