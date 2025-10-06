import { commaToPoint } from '../common';
import { JarjestyskriteeriParams } from '../types/jarjestyskriteeri-types';
import {
  MuokattuJonosijaChangeEvent,
  MuokattuJonosijaContext,
} from './muokattuJonosijaMachineTypes';

export function applyKriteeriChange(
  context: MuokattuJonosijaContext,
  event: MuokattuJonosijaChangeEvent,
): Array<JarjestyskriteeriParams> {
  const originalKriteeri = context.jonosija.jarjestyskriteerit?.find(
    (k) => k.prioriteetti === event.prioriteetti,
  );
  const existingChangedKriteeri = context.changedKriteerit.find(
    (k) => k.prioriteetti == event.prioriteetti,
  );
  if (
    commaToPoint(originalKriteeri?.arvo) === commaToPoint(event.arvo) &&
    originalKriteeri?.kuvaus?.FI === event.selite &&
    originalKriteeri.tila === event.tila
  ) {
    if (existingChangedKriteeri) {
      return context.changedKriteerit.filter(
        (ck) => ck.prioriteetti !== existingChangedKriteeri.prioriteetti,
      );
    }
    return context.changedKriteerit;
  }

  if (existingChangedKriteeri) {
    existingChangedKriteeri.arvo = event.arvo;
    existingChangedKriteeri.selite = event.selite;
    existingChangedKriteeri.tila = event.tila;
    return context.changedKriteerit.map((ck) =>
      ck.prioriteetti === event.prioriteetti ? existingChangedKriteeri : ck,
    );
  } else {
    return [
      ...context.changedKriteerit,
      {
        arvo: event.arvo,
        prioriteetti: event.prioriteetti,
        selite: event.selite,
        tila: event.tila,
      },
    ];
  }
}

export function hasChangedKriteerit({
  context,
}: {
  context: MuokattuJonosijaContext;
}) {
  return context.changedKriteerit.length > 0;
}

export function isModifiedJonosija({
  context,
}: {
  context: MuokattuJonosijaContext;
}) {
  return Boolean(context.jonosija.muokattu);
}
