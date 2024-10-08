import { expect, test } from 'vitest';
import { SijoittelunTila } from '../lib/types/sijoittelu-types';
import { sortBySijoittelunTila } from './common';

const hakemukset = [
  {
    tila: SijoittelunTila.PERUNUT,
  },
  {
    tila: SijoittelunTila.HYVAKSYTTY,
  },
  {
    tila: SijoittelunTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  },
  {
    tila: SijoittelunTila.PERUUNTUNUT,
  },
  {
    tila: SijoittelunTila.VARALLA,
  },
  {
    tila: SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
  },
  {
    tila: SijoittelunTila.HYLATTY,
  },
  {
    tila: SijoittelunTila.PERUUTETTU,
  },
];

test('sorts by sijoitteluntila asc', () => {
  const sorted = sortBySijoittelunTila('asc', hakemukset).map((h) => h.tila);
  expect(sorted).toEqual([
    SijoittelunTila.HYVAKSYTTY,
    SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    SijoittelunTila.HARKINNANVARAISESTI_HYVAKSYTTY,
    SijoittelunTila.VARALLA,
    SijoittelunTila.HYLATTY,
    SijoittelunTila.PERUUNTUNUT,
    SijoittelunTila.PERUNUT,
    SijoittelunTila.PERUUTETTU,
  ]);
});

test('sorts by sijoitteluntila desc', () => {
  const sorted = sortBySijoittelunTila('desc', hakemukset).map((h) => h.tila);
  expect(sorted).toEqual([
    SijoittelunTila.PERUUTETTU,
    SijoittelunTila.PERUNUT,
    SijoittelunTila.PERUUNTUNUT,
    SijoittelunTila.HYLATTY,
    SijoittelunTila.VARALLA,
    SijoittelunTila.HARKINNANVARAISESTI_HYVAKSYTTY,
    SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    SijoittelunTila.HYVAKSYTTY,
  ]);
});
