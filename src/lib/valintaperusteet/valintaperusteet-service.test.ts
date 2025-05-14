import { expect, test, vi, describe, afterEach } from 'vitest';
import {
  getValinnanvaiheet,
  getValintakoeAvaimetHakukohteelle,
  getValintaryhmat,
} from './valintaperusteet-service';
import { client } from '../http-client';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
  ValintakoeAvaimet,
  ValintakoeInputTyyppi,
  ValintaryhmaHakukohteilla,
} from './valintaperusteet-types';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/configuration';

buildConfiguration().then(setConfiguration);

describe('Valintaperusteet: getValinnanvaiheet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns valinnanvaiheet', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() => buildDummyValinnanvaiheResponse());
    const vaiheet: Array<Valinnanvaihe> =
      await getValinnanvaiheet('hakukohdeOid');
    expect(vaiheet.length).toEqual(1);
    const vaihe = vaiheet[0];
    assertValinnanvaihe(vaihe);
    const jono = vaihe.jonot[0];
    expect(jono.nimi).toEqual('Lukiokoulutus');
    expect(jono.eiLasketaPaivamaaranJalkeen).toBeUndefined();
    expect(jono.prioriteetti).toEqual(1);
  });

  test('returns only active valintatapajono', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() =>
      buildDummyValinnanvaiheResponse([
        {
          nimi: 'Lukiokoulutus',
          oid: 'jononOid',
          aktiivinen: false,
          valisijoittelu: false,
          prioriteetti: 1,
          eilasketapaivamaaranJalkeen: null,
        },
      ]),
    );
    const vaiheet: Array<Valinnanvaihe> =
      await getValinnanvaiheet('hakukohdeOid');
    expect(vaiheet.length).toEqual(1);
    const vaihe = vaiheet[0];
    assertValinnanvaihe(vaihe);
    expect(vaihe.jonot.length).toEqual(0);
  });

  test('retuns valintatapajonot sorted by prioriteetti', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() =>
      buildDummyValinnanvaiheResponse([
        {
          nimi: 'Lukiokoulutus',
          oid: 'jononOid',
          aktiivinen: true,
          valisijoittelu: false,
          prioriteetti: 3,
          eilasketapaivamaaranJalkeen: null,
        },
        {
          nimi: 'Muu koulutus',
          oid: 'jononOid3',
          aktiivinen: true,
          valisijoittelu: false,
          prioriteetti: 2,
          eilasketapaivamaaranJalkeen: null,
        },
        {
          nimi: 'Ammatillinen koulutus',
          oid: 'jononOid2',
          aktiivinen: true,
          valisijoittelu: false,
          prioriteetti: 1,
          eilasketapaivamaaranJalkeen: null,
        },
      ]),
    );
    const vaiheet: Array<Valinnanvaihe> =
      await getValinnanvaiheet('hakukohdeOid');
    expect(vaiheet.length).toEqual(1);
    const vaihe = vaiheet[0];
    assertValinnanvaihe(vaihe);
    expect(vaihe.jonot.length).toEqual(3);
    expect(vaihe.jonot[0].nimi).toEqual('Ammatillinen koulutus');
    expect(vaihe.jonot[1].nimi).toEqual('Muu koulutus');
    expect(vaihe.jonot[2].nimi).toEqual('Lukiokoulutus');
  });
});

function assertValinnanvaihe(vaihe: Valinnanvaihe) {
  expect(vaihe.nimi).toEqual('Varsinainen valinta');
  expect(vaihe.aktiivinen).toBeTruthy();
  expect(vaihe.tyyppi).toEqual(ValinnanvaiheTyyppi.TAVALLINEN);
}

function buildDummyValinnanvaiheResponse(
  valintatapajonot?: Array<{
    nimi: string;
    oid: string;
    aktiivinen: boolean;
    prioriteetti: number;
    valisijoittelu: boolean;
    eilasketapaivamaaranJalkeen: string | null;
  }>,
) {
  const dummyJonot = valintatapajonot ?? [
    {
      nimi: 'Lukiokoulutus',
      oid: 'jononOid',
      aktiivinen: true,
      valisijoittelu: false,
      prioriteetti: 1,
      eilasketapaivamaaranJalkeen: null,
    },
  ];

  return Promise.resolve({
    headers: new Headers(),
    data: [
      {
        oid: 'vvoid',
        nimi: 'Varsinainen valinta',
        aktiivinen: true,
        hasValisijoittelu: true,
        valinnanvaihetyyppi: 'tavallinen',
        jonot: dummyJonot,
      },
    ],
  });
}

describe('Valintaperusteet: getValintakokeet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns valintakokeet', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() => buildDummyValinkoeResponse());
    const kokeet: Array<ValintakoeAvaimet> =
      await getValintakoeAvaimetHakukohteelle('hakukohdeOid');
    expect(kokeet.length).toEqual(1);
  });

  test('returns valintakokeet with appropriate inputTyyppi', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() =>
      buildDummyValinkoeResponse([
        {
          tunniste: 'input-tunniste',
          arvot: null,
          kuvaus: 'kuvaus',
          osallistuminenTunniste: 'input-tunniste-osallistuminen',
          vaatiiOsallistumisen: true,
          funktiotyyppi: 'MUU',
        },
        {
          tunniste: 'boolean-tunniste',
          arvot: null,
          kuvaus: 'kuvaus',
          osallistuminenTunniste: 'boolean-tunniste-osallistuminen',
          vaatiiOsallistumisen: true,
          funktiotyyppi: 'TOTUUSARVOFUNKTIO',
        },
        {
          tunniste: 'boolean-kielikoe-tunniste',
          arvot: null,
          kuvaus: 'kuvaus',
          osallistuminenTunniste: 'boolean-kielikoe-tunniste-osallistuminen',
          vaatiiOsallistumisen: true,
          funktiotyyppi: 'TOTUUSARVOFUNKTIO',
        },
        {
          tunniste: 'select-tunniste',
          arvot: ['nakki', 'peruna', 'sose'],
          kuvaus: 'kuvaus',
          osallistuminenTunniste: 'select-tunniste-osallistuminen',
          vaatiiOsallistumisen: true,
          funktiotyyppi: 'muu',
        },
      ]),
    );
    const kokeet: Array<ValintakoeAvaimet> =
      await getValintakoeAvaimetHakukohteelle('hakukohdeOid');
    expect(kokeet.length).toEqual(4);
    expect(kokeet[0].inputTyyppi).toEqual(ValintakoeInputTyyppi.INPUT);
    expect(kokeet[1].inputTyyppi).toEqual(ValintakoeInputTyyppi.BOOLEAN);
    expect(kokeet[2].inputTyyppi).toEqual(
      ValintakoeInputTyyppi.BOOLEAN_ACCEPTED,
    );
    expect(kokeet[3].inputTyyppi).toEqual(ValintakoeInputTyyppi.SELECT);
  });
});

test('Valintaperusteet: getValintaryhmat', async () => {
  const clientSpy = vi.spyOn(client, 'get');
  clientSpy.mockImplementationOnce(() =>
    Promise.resolve({
      headers: new Headers(),
      data: [
        {
          hakuOid: 'haku-1',
          oid: '12334-123',
          nimi: 'Haun valintaryhmä',
          hakukohdeViitteet: [],
          alavalintaryhmat: [
            {
              hakuOid: null,
              oid: '22334-123',
              nimi: 'Valintaryhmä 1',
              hakukohdeViitteet: [],
              alavalintaryhmat: [
                {
                  hakuOid: null,
                  oid: '22334-223',
                  nimi: 'Kokeet',
                  hakukohdeViitteet: [{ oid: 'hk-1' }, { oid: 'hk-2' }],
                  alavalintaryhmat: [],
                },
              ],
            },
            {
              hakuOid: null,
              oid: '32334-123',
              nimi: 'Valintaryhmä 2',
              hakukohdeViitteet: [{ oid: 'hk-3' }],
              alavalintaryhmat: [],
            },
          ],
        },
      ],
    }),
  );
  const ryhmat: {
    hakuRyhma: ValintaryhmaHakukohteilla | null;
    muutRyhmat: Array<ValintaryhmaHakukohteilla>;
  } = await getValintaryhmat('haku-1');
  expect(ryhmat.hakuRyhma?.nimi).toEqual('Haun valintaryhmä');
  expect(ryhmat.muutRyhmat.map((r) => r.nimi)).toEqual([
    'Valintaryhmä 1',
    'Valintaryhmä 2',
  ]);
  expect(
    ryhmat.muutRyhmat
      .find((r) => r.nimi === 'Valintaryhmä 1')
      ?.alaValintaryhmat.map((r) => r.nimi),
  ).toEqual(['Kokeet']);
});

function buildDummyValinkoeResponse(
  valintakokeet?: Array<{
    tunniste: string;
    arvot: Array<string> | null;
    kuvaus: string;
    max?: string | null;
    min?: string | null;
    osallistuminenTunniste: string;
    vaatiiOsallistumisen: boolean;
    funktiotyyppi: string;
  }>,
) {
  const dummyKokeet = valintakokeet ?? [
    {
      tunniste: 'tunniste',
      arvot: ['0', '1'],
      kuvaus: 'kuvaus',
      osallistuminenTunniste: 'tunniste-osallistuminen',
      vaatiiOsallistumisen: true,
      funktiotyyppi: 'MUU',
    },
  ];

  return Promise.resolve({
    headers: new Headers(),
    data: dummyKokeet,
  });
}
