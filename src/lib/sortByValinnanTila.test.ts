import { expect, test } from 'vitest';
import { ValinnanTila } from './types/sijoittelu-types';
import { sortByValinnanTila } from './sortByValinnanTila';

const hakemukset = [
  {
    tila: ValinnanTila.PERUNUT,
  },
  {
    tila: ValinnanTila.HYVAKSYTTY,
  },
  {
    tila: ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  },
  {
    tila: ValinnanTila.PERUUNTUNUT,
  },
  {
    tila: ValinnanTila.VARALLA,
  },
  {
    tila: ValinnanTila.VARASIJALTA_HYVAKSYTTY,
  },
  {
    tila: ValinnanTila.HYLATTY,
  },
  {
    tila: ValinnanTila.PERUUTETTU,
  },
];

test('sorts by sijoitteluntila asc', () => {
  const sorted = sortByValinnanTila('asc', hakemukset).map((h) => h.tila);
  expect(sorted).toEqual([
    ValinnanTila.HYVAKSYTTY,
    ValinnanTila.VARASIJALTA_HYVAKSYTTY,
    ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
    ValinnanTila.VARALLA,
    ValinnanTila.HYLATTY,
    ValinnanTila.PERUUNTUNUT,
    ValinnanTila.PERUNUT,
    ValinnanTila.PERUUTETTU,
  ]);
});

test('sorts by sijoitteluntila desc', () => {
  const sorted = sortByValinnanTila('desc', hakemukset).map((h) => h.tila);
  expect(sorted).toEqual([
    ValinnanTila.PERUUTETTU,
    ValinnanTila.PERUNUT,
    ValinnanTila.PERUUNTUNUT,
    ValinnanTila.HYLATTY,
    ValinnanTila.VARALLA,
    ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
    ValinnanTila.VARASIJALTA_HYVAKSYTTY,
    ValinnanTila.HYVAKSYTTY,
  ]);
});

test('sorts by sijoitteluntila asc with sijoittelunTila property', () => {
  const arr = [
    { sijoittelunTila: ValinnanTila.PERUNUT },
    { sijoittelunTila: ValinnanTila.HYVAKSYTTY },
    { sijoittelunTila: ValinnanTila.HYLATTY },
  ];
  const sorted = sortByValinnanTila('asc', arr).map((h) => h.sijoittelunTila);
  expect(sorted).toEqual([
    ValinnanTila.HYVAKSYTTY,
    ValinnanTila.HYLATTY,
    ValinnanTila.PERUNUT,
  ]);
});

test('sorts by sijoitteluntila desc with sijoittelunTila property', () => {
  const arr = [
    { sijoittelunTila: ValinnanTila.PERUNUT },
    { sijoittelunTila: ValinnanTila.HYVAKSYTTY },
    { sijoittelunTila: ValinnanTila.HYLATTY },
  ];
  const sorted = sortByValinnanTila('desc', arr).map((h) => h.sijoittelunTila);
  expect(sorted).toEqual([
    ValinnanTila.PERUNUT,
    ValinnanTila.HYLATTY,
    ValinnanTila.HYVAKSYTTY,
  ]);
});

test('sorts VARALLA by varasijanNumero asc', () => {
  const arr = [
    { tila: ValinnanTila.VARALLA, varasijanNumero: 3 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 1 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 2 },
  ];
  const sorted = sortByValinnanTila('asc', arr).map((h) => h.varasijanNumero);
  expect(sorted).toEqual([1, 2, 3]);
});

test('sorts VARALLA by varasijanNumero desc', () => {
  const arr = [
    { tila: ValinnanTila.VARALLA, varasijanNumero: 3 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 1 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 2 },
  ];
  const sorted = sortByValinnanTila('desc', arr).map((h) => h.varasijanNumero);
  expect(sorted).toEqual([3, 2, 1]);
});

test('handles missing sijoittelunTila and tila ascending', () => {
  const arr = [
    { foo: 'bar' },
    { tila: ValinnanTila.HYVAKSYTTY },
    { sijoittelunTila: ValinnanTila.HYLATTY },
  ];
  const sorted = sortByValinnanTila('asc', arr)!;
  expect(sorted[0]?.tila).toBe(ValinnanTila.HYVAKSYTTY);
  expect(sorted[1]?.sijoittelunTila).toBe(ValinnanTila.HYLATTY);
  expect(sorted[2]?.foo).toBe('bar');
});

test('handles missing sijoittelunTila and tila descending', () => {
  const arr = [
    { foo: 'bar' },
    { tila: ValinnanTila.HYVAKSYTTY },
    { sijoittelunTila: ValinnanTila.HYLATTY },
  ];
  const sorted = sortByValinnanTila('desc', arr)!;
  expect(sorted[0]?.foo).toBe('bar');
  expect(sorted[1]?.sijoittelunTila).toBe(ValinnanTila.HYLATTY);
  expect(sorted[2]?.tila).toBe(ValinnanTila.HYVAKSYTTY);
});

test('handles undefined varasijanNumero for VARALLA ascending', () => {
  const arr = [
    { tila: ValinnanTila.VARALLA },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 2 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 1 },
  ];
  const sorted = sortByValinnanTila('asc', arr);
  expect(sorted[0]?.varasijanNumero).toBe(1);
  expect(sorted[1]?.varasijanNumero).toBe(2);
  expect(sorted[2]?.varasijanNumero).toBeUndefined();
});

test('handles undefined varasijanNumero for VARALLA descending', () => {
  const arr = [
    { tila: ValinnanTila.VARALLA },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 2 },
    { tila: ValinnanTila.VARALLA, varasijanNumero: 1 },
  ];
  const sorted = sortByValinnanTila('desc', arr);
  expect(sorted[0]?.varasijanNumero).toBeUndefined();
  expect(sorted[1]?.varasijanNumero).toBe(2);
  expect(sorted[2]?.varasijanNumero).toBe(1);
});
