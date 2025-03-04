import {
  SijoittelunTila,
  SijoittelunTilaOrdinals,
} from './types/sijoittelu-types';

type SijoittelunTilaSortable = {
  sijoittelunTila?: SijoittelunTila;
  tila?: SijoittelunTila;
  varasijanNumero?: number;
};

export function sortBySijoittelunTila<T extends SijoittelunTilaSortable>(
  direction: string,
  filtered: T[],
): T[] {
  const asc = direction === 'asc';
  return filtered.sort((a, b) => {
    const aSijoittelunTila = a.sijoittelunTila ?? a.tila;
    const bSijoittelunTila = b.sijoittelunTila ?? b.tila;
    if (aSijoittelunTila && bSijoittelunTila) {
      const aOrdinal = SijoittelunTilaOrdinals[aSijoittelunTila];
      const bOrdinal = SijoittelunTilaOrdinals[bSijoittelunTila];
      if (
        aOrdinal === bOrdinal &&
        aOrdinal === SijoittelunTilaOrdinals[SijoittelunTila.VARALLA] &&
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
