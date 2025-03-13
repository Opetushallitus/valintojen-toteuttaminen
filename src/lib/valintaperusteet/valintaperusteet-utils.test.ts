import { expect, test } from 'vitest';
import { Valinnanvaihe, ValinnanvaiheTyyppi } from './valintaperusteet-types';
import { checkCanStartLaskentaForValinnanvaihe } from './valintaperusteet-utils';

test('laskenta is used for active valinnanvaihe', () => {
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
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeTruthy();
});

test('laskenta is not used for inactive valinnanvaihe', () => {
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
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeFalsy();
});

test('laskenta is not used for valinnanvaihe with valisijoittelu', () => {
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
    valisijoittelu: true,
  };
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeFalsy();
});

test('laskenta is not used for valinnanvaihe when jonos are not using laskenta', () => {
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
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeFalsy();
});

test('laskenta is not used for valinnanvaihe when jonos best before date has passed', () => {
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
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeFalsy();
});

test('laskenta is used for valinnanvaihe when there is at least one eligible jono', () => {
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
  expect(checkCanStartLaskentaForValinnanvaihe(vaihe)).toBeTruthy();
});
