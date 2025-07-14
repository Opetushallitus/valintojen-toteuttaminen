import { ValinnanTila, ValinnanTilaOrdinals } from './types/sijoittelu-types';

type ValinnanTilaSortable = {
  sijoittelunTila?: ValinnanTila;
  tila?: ValinnanTila;
  varasijanNumero?: number;
  valinnanTila?: ValinnanTila;
};

const compareInts = (a: number, b: number, asc: boolean) => {
  if (a > b) return asc ? 1 : -1;
  else if (b > a) return asc ? -1 : 1;
  else return 0;
};

export function sortByValinnanTila<T extends ValinnanTilaSortable>(
  direction: string,
  filtered: Array<T>,
): Array<T> {
  const asc = direction === 'asc';
  return filtered.sort((a, b) => {
    const aSijoittelunTila = a.sijoittelunTila ?? a.tila ?? a.valinnanTila;
    const bSijoittelunTila = b.sijoittelunTila ?? b.tila ?? b.valinnanTila;
    const aOrdinal =
      (aSijoittelunTila && ValinnanTilaOrdinals[aSijoittelunTila]) ?? Infinity;
    const bOrdinal =
      (bSijoittelunTila && ValinnanTilaOrdinals[bSijoittelunTila]) ?? Infinity;
    if (
      aOrdinal === bOrdinal &&
      aOrdinal === ValinnanTilaOrdinals[ValinnanTila.VARALLA]
    ) {
      return compareInts(
        a.varasijanNumero ?? Infinity,
        b.varasijanNumero ?? Infinity,
        asc,
      );
    } else {
      return compareInts(aOrdinal, bOrdinal, asc);
    }
  });
}
