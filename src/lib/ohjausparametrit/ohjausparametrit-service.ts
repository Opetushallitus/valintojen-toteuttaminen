'use client';

import { getConfiguration } from '@/lib/configuration/client-configuration';
import { client } from '../http-client';
import { HaunAsetukset } from './ohjausparametrit-types';
import { getConfigUrl } from '../configuration/configuration-utils';

type HaunAsetuksetResponse = {
  sijoittelu: boolean;
  // Oppilaitosten virkailijoiden valintapalvelun käyttö estetty
  PH_OLVVPKE?: {
    dateStart: number | null;
    dateEnd: number | null;
  };
  // Valintaesityksen hyväksyminen
  PH_VEH?: { date?: string };
  // Varasijatäyttö päättyy
  PH_VSTP?: { date?: string };
  // Harkinnanvaraisen valinnan päätösten tallennus päättyy
  PH_HVVPTP?: { date?: string };
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

  const varasijatayttoPaattyy = response.data.PH_VSTP?.date
    ? new Date(response.data.PH_VSTP.date)
    : undefined;

  const harkinnanvarainenTallennusPaattyy = response.data.PH_HVVPTP?.date
    ? new Date(response.data.PH_HVVPTP.date)
    : undefined;

  const valinnatEstettyOppilaitosvirkailijoilta =
    response.data.PH_OLVVPKE?.dateStart != null &&
    response.data.PH_OLVVPKE?.dateEnd != null
      ? response.data.PH_OLVVPKE
      : undefined;

  return {
    sijoittelu: response.data.sijoittelu,
    valinnatEstettyOppilaitosvirkailijoilta,
    valintaEsityksenHyvaksyminen,
    varasijatayttoPaattyy,
    harkinnanvarainenTallennusPaattyy,
  };
};
