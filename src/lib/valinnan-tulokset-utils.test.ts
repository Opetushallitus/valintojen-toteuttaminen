import { test, describe, expect } from 'vitest';
import { isValidValinnanTila } from './valinnan-tulokset-utils';
import { ValinnanTila, VastaanottoTila } from './types/sijoittelu-types';

describe('isValidValinnanTila', () => {
  test.each([
    [undefined, undefined, true],
    [ValinnanTila.PERUNUT, VastaanottoTila.PERUNUT, true],
    [ValinnanTila.HYLATTY, VastaanottoTila.KESKEN, true],
    [ValinnanTila.VARALLA, VastaanottoTila.KESKEN, true],
    [ValinnanTila.PERUUNTUNUT, VastaanottoTila.KESKEN, true],
    [
      ValinnanTila.PERUUNTUNUT,
      VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
      true,
    ],
    [ValinnanTila.PERUNUT, VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA, true],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, VastaanottoTila.KESKEN, true],
    [
      ValinnanTila.VARASIJALTA_HYVAKSYTTY,
      VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
      true,
    ],
    [
      ValinnanTila.VARASIJALTA_HYVAKSYTTY,
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      true,
    ],
    [ValinnanTila.HYVAKSYTTY, VastaanottoTila.KESKEN, true],
    [
      ValinnanTila.HYVAKSYTTY,
      VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
      true,
    ],
    [ValinnanTila.HYVAKSYTTY, VastaanottoTila.VASTAANOTTANUT_SITOVASTI, true],
    [ValinnanTila.PERUNUT, VastaanottoTila.PERUNUT, true],
    [ValinnanTila.PERUUTETTU, VastaanottoTila.PERUUTETTU, true],
    [ValinnanTila.HYVAKSYTTY, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.HYVAKSYTTY, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.VARALLA, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.VARALLA, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.PERUUNTUNUT, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.PERUUNTUNUT, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.HYLATTY, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.HYLATTY, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.PERUNUT, VastaanottoTila.KESKEN, false],
    [ValinnanTila.PERUNUT, VastaanottoTila.VASTAANOTTANUT_SITOVASTI, false],
    [ValinnanTila.PERUNUT, VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT, false],
    [
      ValinnanTila.PERUNUT,
      VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
      false,
    ],
    [ValinnanTila.PERUUNTUNUT, undefined, true],
    [ValinnanTila.HYLATTY, undefined, true],
    [ValinnanTila.VARALLA, undefined, true],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, undefined, true],
    [ValinnanTila.HYVAKSYTTY, undefined, true],
    [ValinnanTila.PERUNUT, undefined, false],
    [ValinnanTila.PERUUTETTU, undefined, false],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.VARASIJALTA_HYVAKSYTTY, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.VARALLA, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.VARALLA, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.PERUUNTUNUT, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.PERUUNTUNUT, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.HYLATTY, VastaanottoTila.PERUNUT, false],
    [ValinnanTila.HYLATTY, VastaanottoTila.PERUUTETTU, false],
    [ValinnanTila.PERUNUT, VastaanottoTila.KESKEN, false],
  ])(
    'when valinnanTila is %s and vastaanottoTila is %s, returns %s',
    (valinnanTila, vastaanottoTila, expected) => {
      const result = isValidValinnanTila({ valinnanTila, vastaanottoTila });
      expect(result).toBe(expected);
    },
  );
});
