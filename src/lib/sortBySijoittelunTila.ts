import { ValinnanTila, ValinnanTilaOrdinals } from './types/sijoittelu-types';

type SijoittelunTilaSortable = {
  sijoittelunTila?: ValinnanTila;
  tila?: ValinnanTila;
  varasijanNumero?: number;
};

const compareInts = (a: number, b: number, asc: boolean) => {
  switch (true) {
    case a > b:
      return asc ? 1 : -1;
    case b > a:
      return asc ? -1 : 1;
    default:
      return 0;
  }
};

export function sortBySijoittelunTila<T extends SijoittelunTilaSortable>(
  direction: string,
  filtered: Array<T>,
): Array<T> {
  const asc = direction === 'asc';
  return filtered.sort((a, b) => {
    const aSijoittelunTila = a.sijoittelunTila ?? a.tila;
    const bSijoittelunTila = b.sijoittelunTila ?? b.tila;
    const aOrdinal =
      (aSijoittelunTila && ValinnanTilaOrdinals[aSijoittelunTila]) ?? Infinity;
    const bOrdinal =
      (bSijoittelunTila && ValinnanTilaOrdinals[bSijoittelunTila]) ?? Infinity;
    if (
      aOrdinal === bOrdinal &&
      aOrdinal === ValinnanTilaOrdinals[ValinnanTila.VARALLA] &&
      a.varasijanNumero &&
      b.varasijanNumero
    ) {
      return compareInts(a.varasijanNumero, b.varasijanNumero, asc);
    }

    return compareInts(aOrdinal, bOrdinal, asc);
  });
}
