import { expect, test, vi } from 'vitest';
import { client } from '../http-client';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/server-configuration';
import { getHaunAsetukset } from './ohjausparametrit-service';

test('maps PH_HVVPTP to harkinnanvarainenTallennusPaattyy', async () => {
  const config = await buildConfiguration();
  setConfiguration(config);

  const clientSpy = vi.spyOn(client, 'get');
  clientSpy.mockResolvedValueOnce({
    headers: new Headers(),
    data: {
      sijoittelu: true,
      PH_OLVVPKE: {
        dateStart: 1781154000000,
        dateEnd: 1781240400000,
      },
      PH_VEH: {
        date: 1781092800000,
      },
      PH_VSTP: {
        date: 1786741140000,
      },
      PH_HVVPTP: {
        date: 1779483540000,
      },
    },
  });

  const result = await getHaunAsetukset('1.2.246.562.29.00000000000000075761');

  expect(result).toEqual({
    sijoittelu: true,
    valinnatEstettyOppilaitosvirkailijoilta: {
      dateStart: 1781154000000,
      dateEnd: 1781240400000,
    },
    valintaEsityksenHyvaksyminen: new Date(1781092800000),
    varasijatayttoPaattyy: new Date(1786741140000),
    harkinnanvarainenTallennusPaattyy: new Date(1779483540000),
  });
});
