import { expect, test } from 'vitest';
import { ValinnanTila } from './types/sijoittelu-types';
import { sortBySijoittelunTila } from './sortBySijoittelunTila';

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
  const sorted = sortBySijoittelunTila('asc', hakemukset).map((h) => h.tila);
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
  const sorted = sortBySijoittelunTila('desc', hakemukset).map((h) => h.tila);
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
