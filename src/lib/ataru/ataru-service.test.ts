import { expect, test, vi } from 'vitest';
import { client } from '../http-client';
import { Hakemus } from './ataru-types';
import { getHakemukset } from './ataru-service';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/server-configuration';

test('returns hakemukset', async () => {
  const config = await buildConfiguration();
  setConfiguration(config);
  const clientSpy = vi.spyOn(client, 'get');
  clientSpy.mockImplementationOnce(() => buildDummyHakemukset());
  const hakemukset: Array<Hakemus> = await getHakemukset({
    hakuOid: 'haku1',
    hakukohdeOid: 'hakukohde1',
  });
  expect(hakemukset.length).toEqual(3);
  assertHakemus(hakemukset[0]!, 1, 'Ruhtinas', 'Nukettaja', 1);
  assertHakemus(hakemukset[1]!, 2, 'Kreivi', 'Dacula', 2);
  assertHakemus(hakemukset[2]!, 3, 'Puru', 'Purukumi', 1);
});

function assertHakemus(
  hakemus: Hakemus,
  oidNumber: number,
  etunimet: string,
  sukunimi: string,
  hakutoiveNro: number,
) {
  expect(hakemus.asiointikieliKoodi).toEqual('fi');
  expect(hakemus.hakemusOid).toEqual('hakemus' + oidNumber);
  expect(hakemus.hakijaOid).toEqual('hakija' + oidNumber);
  expect(hakemus.etunimet).toEqual(etunimet);
  expect(hakemus.sukunimi).toEqual(sukunimi);
  expect(hakemus.hakijanNimi).toEqual(`${sukunimi} ${etunimet}`);
  expect(hakemus.hakutoiveNumero).toEqual(hakutoiveNro);
}

export function buildDummyHakemukset() {
  const dummyHakemukset = [
    {
      asiointiKieli: {
        kieliKoodi: 'fi',
        kieliTyyppi: '',
      },
      etunimet: 'Ruhtinas',
      sukunimi: 'Nukettaja',
      personOid: 'hakija1',
      oid: 'hakemus1',
      hakutoiveet: [
        {
          hakukohdeOid: 'hakukohde1',
        },
      ],
    },
    {
      asiointiKieli: {
        kieliKoodi: 'fi',
        kieliTyyppi: '',
      },
      etunimet: 'Kreivi',
      sukunimi: 'Dacula',
      personOid: 'hakija2',
      oid: 'hakemus2',
      hakutoiveet: [
        {
          hakukohdeOid: 'hakukohde2',
        },
        {
          hakukohdeOid: 'hakukohde1',
        },
      ],
    },
    {
      asiointiKieli: {
        kieliKoodi: 'fi',
        kieliTyyppi: '',
      },
      etunimet: 'Puru',
      sukunimi: 'Purukumi',
      personOid: 'hakija3',
      oid: 'hakemus3',
      hakutoiveet: [
        {
          hakukohdeOid: 'hakukohde1',
        },
      ],
    },
  ];

  return Promise.resolve({
    headers: new Headers(),
    data: dummyHakemukset,
  });
}
