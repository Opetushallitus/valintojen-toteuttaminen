'use client';

import { getConfiguration } from '@/lib/configuration/client-configuration';
import { client } from '../http-client';
import { HaunAsetukset } from './ohjausparametrit-types';
import { getConfigUrl } from '../configuration/configuration-utils';

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
  const configuration = getConfiguration();
  const response = await client.get<HaunAsetuksetResponse>(
    getConfigUrl(configuration.routes.yleiset.ohjausparametritUrl, { hakuOid }),
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
