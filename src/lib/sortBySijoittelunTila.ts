import { ValinnanTila, ValinnanTilaOrdinals } from './types/sijoittelu-types';

type SijoittelunTilaSortable = {
  sijoittelunTila?: ValinnanTila;
  tila?: ValinnanTila;
  varasijanNumero?: number;
  valinnanTila?: ValinnanTila;
};

const compareInts = (
  a: number | undefined,
  b: number | undefined,
  asc: boolean,
) => {
  if (a === undefined && b === undefined) return 0;
  else if (a === undefined) return -1;
  else if (b === undefined) return 1;
  else if (a > b) return asc ? 1 : -1;
  else if (b > a) return asc ? -1 : 1;
  else return 0;
};

export function sortBySijoittelunTila<T extends SijoittelunTilaSortable>(
  direction: string,
  filtered: Array<T>,
): Array<T> {
  const asc = direction === 'asc';
  return filtered.sort((a, b) => {
    const aSijoittelunTila = a.sijoittelunTila ?? a.tila ?? a.valinnanTila;
    const bSijoittelunTila = b.sijoittelunTila ?? b.tila ?? b.valinnanTila;
    const aOrdinal = aSijoittelunTila && ValinnanTilaOrdinals[aSijoittelunTila];
    const bOrdinal = bSijoittelunTila && ValinnanTilaOrdinals[bSijoittelunTila];
    if (
      aOrdinal === bOrdinal &&
      aOrdinal === ValinnanTilaOrdinals[ValinnanTila.VARALLA]
    ) {
      return compareInts(a.varasijanNumero, b.varasijanNumero, asc);
    } else {
      return compareInts(aOrdinal, bOrdinal, asc);
    }
  });
}
