import { Toast } from '@/hooks/useToaster';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/lib/types/laskenta-types';
import { updatePisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useActorRef, useSelector } from '@xstate/react';
import { useMemo } from 'react';
import { clone, indexBy, isEmpty, isNonNullish, isNumber, prop } from 'remeda';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { ValintakoeAvaimet } from '../valintaperusteet/valintaperusteet-types';

export type PisteSyottoContext = {
  pistetiedot: Array<HakemuksenPistetiedot>;
  changedPistetiedot: Array<HakemuksenPistetiedot>;
  kokeetByTunniste: Record<string, ValintakoeAvaimet>;
  toastMessage?: string;
};

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

type PistesyottoAnyEvent =
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

const isKoeValuesEqual = (
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
    oldArvo === newKoe?.arvo
  );
};

export type PistesyottoActorRef = ActorRefFrom<
  ReturnType<typeof createPisteSyottoMachine>
>;

const pistetietoChangeReducer = ({
  context,
  event,
}: {
  context: PisteSyottoContext;
  event: PistesyottoChangedPistetietoEvent;
}) => {
  const changedPistetieto = context.changedPistetiedot.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );
  const existingPistetieto = context.pistetiedot.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  const existingKoe = existingPistetieto?.valintakokeenPisteet?.find(
    (k) => k.tunniste === event.koeTunniste,
  );

  const pistetieto = clone(changedPistetieto || existingPistetieto);
  const koe = pistetieto?.valintakokeenPisteet.find(
    (k) => k.tunniste === event.koeTunniste,
  );

  if (pistetieto && koe) {
    const newArvo = event.arvo;

    if (
      newArvo &&
      koe.osallistuminen === ValintakoeOsallistuminenTulos.MERKITSEMATTA
    ) {
      koe.osallistuminen = ValintakoeOsallistuminenTulos.OSALLISTUI;
    } else {
      koe.osallistuminen = event.osallistuminen ?? koe.osallistuminen;
    }

    if (
      event.osallistuminen &&
      event.osallistuminen !== ValintakoeOsallistuminenTulos.OSALLISTUI
    ) {
      koe.arvo = '';
    } else {
      koe.arvo = event.arvo ?? koe.arvo;
    }

    if (changedPistetieto) {
      let newPisteet = pistetieto.valintakokeenPisteet;

      // muuttunut kokeen pistetieto sama kuin alkuperäinen
      if (isKoeValuesEqual(existingKoe, koe)) {
        newPisteet = newPisteet?.filter(
          (p) => p.tunniste !== event.koeTunniste,
        );
      }

      // pistetiedolla ei enää muokattuja kokeen pisteitä, voidaan poistaa
      if (isEmpty(newPisteet ?? [])) {
        return context.changedPistetiedot.filter(
          (p) => p.hakemusOid !== event.hakemusOid,
        );
      }

      // pistetiedolla edelleen muokattuja kokeen pisteitä. Vaihdetaan muokattuun pistetietoon.
      pistetieto.valintakokeenPisteet = newPisteet;

      return context.changedPistetiedot.map((h) =>
        h.hakemusOid === event.hakemusOid ? pistetieto : h,
      );
    } else {
      return [...context.changedPistetiedot, pistetieto];
    }
  }
  return context.changedPistetiedot;
};

export const createPisteSyottoMachine = (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
  valintakokeet: Array<ValintakoeAvaimet>,
  addToast: (toast: Toast) => void,
) => {
  const kokeetByTunniste = indexBy(valintakokeet, prop('tunniste'));
  return createMachine({
    id: `PistesyottoMachine-${hakukohdeOid}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot,
      changedPistetiedot: [],
      kokeetByTunniste,
    },
    types: {} as {
      context: PisteSyottoContext;
      events: PistesyottoAnyEvent;
      actions:
        | { type: 'alert'; params: { message: string } }
        | { type: 'successNotify' };
    },
    states: {
      [PisteSyottoStates.IDLE]: {
        on: {
          [PisteSyottoEvent.PISTETIETO_CHANGED]: {
            actions: assign({
              changedPistetiedot: pistetietoChangeReducer,
            }),
          },
          [PisteSyottoEvent.UPDATE]: [
            {
              guard: 'hasUnchangedPistetiedot',
              target: PisteSyottoStates.IDLE,
              actions: {
                type: 'alert',
                params: { message: 'virhe.eimuutoksia' },
              },
            },
            {
              guard: 'hasInvalidPisteet',
              target: PisteSyottoStates.IDLE,
              actions: {
                type: 'alert',
                params: { message: 'virhe.tarkistasyote' },
              },
            },
            {
              target: PisteSyottoStates.UPDATING,
            },
          ],
        },
      },
      [PisteSyottoStates.UPDATING]: {
        invoke: {
          src: 'updatePistetiedot',
          input: ({ context }) => context.changedPistetiedot,
          onDone: {
            target: PisteSyottoStates.UPDATE_COMPLETED,
          },
          onError: {
            target: PisteSyottoStates.ERROR,
          },
        },
      },
      [PisteSyottoStates.ERROR]: {
        always: [
          {
            target: PisteSyottoStates.IDLE,
            actions: {
              type: 'alert',
              params: { message: 'virhe.tallennus' },
            },
          },
        ],
      },
      [PisteSyottoStates.UPDATE_COMPLETED]: {
        always: [
          {
            target: PisteSyottoStates.IDLE,
            actions: 'successNotify',
          },
        ],
        entry: [
          assign({
            pistetiedot: ({ context }) =>
              context.pistetiedot.map((p) => {
                const changed = context.changedPistetiedot.find(
                  (c) => c.hakemusOid === p.hakemusOid,
                );
                return changed ?? p;
              }),
          }),
          assign({
            changedPistetiedot: [],
          }),
        ],
      },
    },
  }).provide({
    guards: {
      hasUnchangedPistetiedot: ({ context }) =>
        context.changedPistetiedot.length < 1,
      hasInvalidPisteet: ({ context }) =>
        isNonNullish(
          context.changedPistetiedot
            .flatMap((pt) => pt.valintakokeenPisteet)
            .find((p) => {
              const matchingKoe = context.kokeetByTunniste[p.tunniste];
              const maxVal =
                isNonNullish(matchingKoe.max) &&
                Number.parseFloat(matchingKoe.max);
              const minVal =
                isNonNullish(matchingKoe.min) &&
                Number.parseFloat(matchingKoe.min);
              const invalid: boolean =
                (isNumber(minVal) &&
                  (isNaN(Number(p.arvo)) ||
                    (minVal as number) > Number(p.arvo))) ||
                (isNumber(maxVal) &&
                  (isNaN(Number(p.arvo)) ||
                    (maxVal as number) < Number(p.arvo)));
              return invalid;
            }),
        ),
    },
    actions: {
      alert: (_, params) =>
        addToast({
          key: `pistetiedot-update-failed-for-${hakukohdeOid}`,
          message: (params as { message: string }).message,
          type: 'error',
        }),
      successNotify: () =>
        addToast({
          key: `pistetiedot-updated-for-${hakukohdeOid}`,
          message: 'pistesyotto.valmis',
          type: 'success',
        }),
    },
    actors: {
      updatePistetiedot: fromPromise(
        ({ input }: { input: Array<HakemuksenPistetiedot> }) => {
          return updatePisteetForHakukohde(hakuOid, hakukohdeOid, input);
        },
      ),
    },
  });
};

type PistesyottoMachineParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetiedot: Array<HakemuksenPistetiedot>;
  valintakokeet: Array<ValintakoeAvaimet>;
  addToast: (toast: Toast) => void;
};

export const usePistesyottoState = ({
  hakuOid,
  hakukohdeOid,
  pistetiedot,
  valintakokeet,
  addToast,
}: PistesyottoMachineParams) => {
  const machine = useMemo(() => {
    return createPisteSyottoMachine(
      hakuOid,
      hakukohdeOid,
      pistetiedot,
      valintakokeet,
      addToast,
    );
  }, [hakuOid, hakukohdeOid, pistetiedot, valintakokeet, addToast]);

  const actorRef = useActorRef(machine);
  return usePistesyottoActorRef(actorRef);
};

export const usePistesyottoActorRef = (actorRef: PistesyottoActorRef) => {
  const snapshot = useSelector(actorRef, (s) => s);
  const isDirty = useIsDirty(actorRef);
  return {
    actorRef,
    snapshot,
    isUpdating: snapshot.matches(PisteSyottoStates.UPDATING),
    onKoeChange: (params: PistesyottoChangeParams) => {
      actorRef.send({
        type: PisteSyottoEvent.PISTETIETO_CHANGED,
        ...params,
      });
    },
    savePistetiedot: () => {
      actorRef.send({ type: PisteSyottoEvent.UPDATE });
    },
    isDirty,
  };
};

export const useKoePistetiedot = (
  pistesyottoActor: PistesyottoActorRef,
  { hakemusOid, koeTunniste }: { hakemusOid: string; koeTunniste: string },
) => {
  return useSelector(pistesyottoActor, (s) => {
    const koe = (
      s.context.changedPistetiedot.find(
        (p: { hakemusOid: string }) => p.hakemusOid === hakemusOid,
      ) ??
      s.context.pistetiedot.find(
        (p: { hakemusOid: string }) => p.hakemusOid === hakemusOid,
      )
    )?.valintakokeenPisteet.find(
      (p: { tunniste: string }) => p.tunniste === koeTunniste,
    );
    return {
      arvo: koe?.arvo ?? '',
      osallistuminen: koe?.osallistuminen,
    };
  });
};

export const useIsDirty = (pistesyottoActorRef: PistesyottoActorRef) =>
  useSelector(
    pistesyottoActorRef,
    (s) => s.context.changedPistetiedot.length !== 0,
  );
