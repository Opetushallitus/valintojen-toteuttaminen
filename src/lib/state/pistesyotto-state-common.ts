import { ValintakoeOsallistuminenTulos } from '@/lib/types/laskenta-types';

export enum PisteSyottoStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  ERROR = 'ERROR',
}

export enum PisteSyottoEvent {
  UPDATE = 'UPDATE',
  PISTETIETO_CHANGED = 'PISTETIETO_CHANGED',
}

export type PistesyottoAnyEvent =
  | PistesyottoUpdateEvent
  | PistesyottoChangedPistetietoEvent;

export type PistesyottoUpdateEvent = {
  type: PisteSyottoEvent.UPDATE;
};

export type PistesyottoChangeParams = {
  hakemusOid: string;
  koeTunniste: string;
  arvo?: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
};

export type PistesyottoChangedPistetietoEvent = {
  type: PisteSyottoEvent.PISTETIETO_CHANGED;
} & PistesyottoChangeParams;

export const isKoeValuesEqual = (
  oldKoe:
    | { arvo?: string; osallistuminen: ValintakoeOsallistuminenTulos }
    | undefined,
  newKoe:
    | { arvo?: string; osallistuminen: ValintakoeOsallistuminenTulos }
    | undefined,
) => {
  const oldArvo = oldKoe?.arvo ?? '';

  return (
    oldKoe?.osallistuminen === newKoe?.osallistuminen &&
    oldArvo === (newKoe?.arvo ?? '')
  );
};
