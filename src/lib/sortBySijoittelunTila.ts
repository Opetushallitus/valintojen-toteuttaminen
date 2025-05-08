import { ValinnanTila, ValinnanTilaOrdinals } from './types/sijoittelu-types';

type SijoittelunTilaSortable = {
  sijoittelunTila?: ValinnanTila;
  tila?: ValinnanTila;
  varasijanNumero?: number;
};

export function sortBySijoittelunTila<T extends SijoittelunTilaSortable>(
  direction: string,
  filtered: Array<T>,
): Array<T> {
  const asc = direction === 'asc';
  return filtered.sort((a, b) => {
    const aSijoittelunTila = a.sijoittelunTila ?? a.tila;
    const bSijoittelunTila = b.sijoittelunTila ?? b.tila;
    if (aSijoittelunTila && bSijoittelunTila) {
      const aOrdinal = ValinnanTilaOrdinals[aSijoittelunTila];
      const bOrdinal = ValinnanTilaOrdinals[bSijoittelunTila];
      if (
        aOrdinal === bOrdinal &&
        aOrdinal === ValinnanTilaOrdinals[ValinnanTila.VARALLA] &&
        a.varasijanNumero &&
        b.varasijanNumero
      ) {
        return a.varasijanNumero > b.varasijanNumero
          ? asc
            ? 1
            : -1
          : b.varasijanNumero > a.varasijanNumero
            ? asc
              ? -1
              : 1
            : 0;
      }
      return aOrdinal > bOrdinal
        ? asc
          ? 1
          : -1
        : bOrdinal > aOrdinal
          ? asc
            ? -1
            : 1
          : 0;
    }
    return aSijoittelunTila
      ? asc
        ? 1
        : -1
      : bSijoittelunTila
        ? asc
          ? -1
          : 1
        : 0;
  });
}
