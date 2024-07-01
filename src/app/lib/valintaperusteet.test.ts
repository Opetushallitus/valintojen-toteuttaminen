import { expect, test, vi, describe, afterEach } from 'vitest';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
  getValinnanvaiheet,
  isCalculationUsedForValinnanvaihe,
} from './valintaperusteet';
import { client } from './http-client';

test('calculation is used for active valinnanvaihe', () => {
  const vaihe: Valinnanvaihe = {
    aktiivinen: true,
    jonot: [
      {
        kaytetaanValintalaskentaa: true,
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
    ],
    nimi: 'vaihe',
    oid: '2.3',
    tyyppi: ValinnanvaiheTyyppi.TAVALLINEN,
    valisijoittelu: false,
  };
  expect(isCalculationUsedForValinnanvaihe(vaihe)).toBeTruthy();
});

test('calculation is not used for inactive valinnanvaihe', () => {
  const vaihe: Valinnanvaihe = {
    aktiivinen: false,
    jonot: [
      {
        kaytetaanValintalaskentaa: true,
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
    ],
    nimi: 'vaihe',
    oid: '2.3',
    tyyppi: ValinnanvaiheTyyppi.TAVALLINEN,
    valisijoittelu: false,
  };
  expect(isCalculationUsedForValinnanvaihe(vaihe)).toBeFalsy();
});

test('calculation is not used for valinnanvaihe when jonos are not using calculation', () => {
  const vaihe: Valinnanvaihe = {
    aktiivinen: true,
    jonot: [
      {
        kaytetaanValintalaskentaa: false,
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
    ],
    nimi: 'vaihe',
    oid: '2.3',
    tyyppi: ValinnanvaiheTyyppi.TAVALLINEN,
    valisijoittelu: false,
  };
  expect(isCalculationUsedForValinnanvaihe(vaihe)).toBeFalsy();
});

test('calculation is not used for valinnanvaihe when jonos best before date has passed ', () => {
  const vaihe: Valinnanvaihe = {
    aktiivinen: true,
    jonot: [
      {
        kaytetaanValintalaskentaa: true,
        eiLasketaPaivamaaranJalkeen: new Date(1719828150947),
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
    ],
    nimi: 'vaihe',
    oid: '2.3',
    tyyppi: ValinnanvaiheTyyppi.TAVALLINEN,
    valisijoittelu: false,
  };
  expect(isCalculationUsedForValinnanvaihe(vaihe)).toBeFalsy();
});

test('calculation is used for valinnanvaihe when there is at least one eligible jono', () => {
  const vaihe: Valinnanvaihe = {
    aktiivinen: true,
    jonot: [
      {
        kaytetaanValintalaskentaa: false,
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
      {
        kaytetaanValintalaskentaa: true,
        eiLasketaPaivamaaranJalkeen: new Date(1719828150947),
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.6',
      },
      {
        kaytetaanValintalaskentaa: true,
        nimi: 'jono',
        prioriteetti: 1,
        oid: '4.4',
      },
    ],
    nimi: 'vaihe',
    oid: '2.3',
    tyyppi: ValinnanvaiheTyyppi.VALINTAKOE,
    valisijoittelu: false,
  };
  expect(isCalculationUsedForValinnanvaihe(vaihe)).toBeTruthy();
});

describe('Valintaperusteet: getValinnanvaiheet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns valinnanvaiheet', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce(() => buildDummyValinnanvaiheResponse());
    const vaiheet: Valinnanvaihe[] = await getValinnanvaiheet('hakukohdeOid');
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
    const vaiheet: Valinnanvaihe[] = await getValinnanvaiheet('hakukohdeOid');
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
    const vaiheet: Valinnanvaihe[] = await getValinnanvaiheet('hakukohdeOid');
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
  valintatapajonot?: {
    nimi: string;
    oid: string;
    aktiivinen: boolean;
    prioriteetti: number;
    valisijoittelu: boolean;
    eilasketapaivamaaranJalkeen: string | null;
  }[],
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
