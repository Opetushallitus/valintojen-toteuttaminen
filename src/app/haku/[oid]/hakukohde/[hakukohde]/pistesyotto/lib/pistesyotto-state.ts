import { Toast } from '@/app/hooks/useToaster';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import { updatePisteetForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { useActorRef, useSelector } from '@xstate/react';
import { useMemo } from 'react';
import { isDeepEqual, isEmpty } from 'remeda';
import { AnyActorRef, assign, createMachine, fromPromise } from 'xstate';

export type PisteSyottoContext = {
  pistetiedot: HakemuksenPistetiedot[];
  changedPistetiedot: HakemuksenPistetiedot[];
  toastMessage?: string;
};

export enum PisteSyottoStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  ERROR = 'ERROR',
}

export enum PisteSyottoEvent {
  SAVE = 'SAVE',
  ADD_CHANGED_PISTETIETO = 'ADD_CHANGED_PISTETIETO',
}

type PistesyottoAnyEvent =
  | PistesyottoSaveEvent
  | PistesyottoChangedPistetietoEvent;

export type PistesyottoSaveEvent = {
  type: PisteSyottoEvent.SAVE;
};

export type PistesyottoChangedPistetietoEvent = {
  type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO;
  hakemusOid: string;
  koeTunniste: string;
  arvo?: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
};

export const createPisteMachine = (
  hakukohdeOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
) => {
  return createMachine({
    id: `PistesyottoMachine-${hakukohdeOid}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot,
      changedPistetiedot: [],
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
          [PisteSyottoEvent.ADD_CHANGED_PISTETIETO]: {
            actions: assign({
              changedPistetiedot: ({ context, event }) => {
                const changedPistetieto = context.changedPistetiedot.find(
                  (h) => h.hakemusOid === event.hakemusOid,
                );
                const existingPistetieto = context.pistetiedot.find(
                  (h) => h.hakemusOid === event.hakemusOid,
                );

                const changedKoe =
                  changedPistetieto?.valintakokeenPisteet?.find(
                    (k) => k.tunniste === event.koeTunniste,
                  );

                const existingKoe =
                  existingPistetieto?.valintakokeenPisteet?.find(
                    (k) => k.tunniste === event.koeTunniste,
                  );

                const pistetieto = changedPistetieto || existingPistetieto;
                const koe = changedKoe || existingKoe;

                if (pistetieto && koe) {
                  const newArvo = event.arvo;

                  if (
                    newArvo &&
                    koe.osallistuminen ===
                      ValintakoeOsallistuminenTulos.MERKITSEMATTA
                  ) {
                    koe.osallistuminen =
                      ValintakoeOsallistuminenTulos.OSALLISTUI;
                  } else {
                    koe.osallistuminen =
                      event.osallistuminen ?? koe.osallistuminen;
                  }

                  if (
                    event.osallistuminen &&
                    event.osallistuminen !==
                      ValintakoeOsallistuminenTulos.OSALLISTUI
                  ) {
                    koe.arvo = '';
                  } else {
                    koe.arvo = event.arvo ?? koe.arvo;
                  }

                  if (changedPistetieto) {
                    let newPisteet = changedPistetieto?.valintakokeenPisteet;

                    // kokeen pistetieto sama kuin alkuperäinen
                    if (isDeepEqual(changedKoe, existingKoe)) {
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

                    // Jos arvo muuttuu
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
              },
            }),
          },
          [PisteSyottoEvent.SAVE]: [
            {
              guard: 'hasChangedPistetiedot',
              target: PisteSyottoStates.UPDATING,
            },
            {
              target: PisteSyottoStates.IDLE,
              actions: {
                type: 'alert',
                params: { message: 'virhe.eimuutoksia' },
              },
            },
          ],
        },
      },
      [PisteSyottoStates.UPDATING]: {
        invoke: {
          src: 'savePistetiedot',
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
  });
};

export const createPisteSyottoMachine = (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
  addToast: (toast: Toast) => void,
) => {
  const pisteMachine = createPisteMachine(hakukohdeOid, pistetiedot);
  return pisteMachine.provide({
    guards: {
      hasChangedPistetiedot: ({ context }) =>
        context.changedPistetiedot.length > 0,
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
      savePistetiedot: fromPromise(
        ({ input }: { input: HakemuksenPistetiedot[] }) => {
          return updatePisteetForHakukohde(hakuOid, hakukohdeOid, input);
        },
      ),
    },
  });
};

type PistesyottoMachineParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetiedot: HakemuksenPistetiedot[];
  addToast: (toast: Toast) => void;
};

export const usePistesyottoActorRef = ({
  hakuOid,
  hakukohdeOid,
  pistetiedot,
  addToast,
}: PistesyottoMachineParams) => {
  const machine = useMemo(() => {
    return createPisteSyottoMachine(
      hakuOid,
      hakukohdeOid,
      pistetiedot,
      addToast,
    );
  }, [hakuOid, hakukohdeOid, pistetiedot, addToast]);

  return useActorRef(machine);
};

export const useOsallistumistieto = (
  pistesyottoActor: AnyActorRef,
  { hakemusOid, koeTunniste }: { hakemusOid: string; koeTunniste: string },
) => {
  return useSelector(pistesyottoActor, (s) => {
    const pistetieto =
      s.context.changedPistetiedot.find(
        (p: { hakemusOid: string }) => p.hakemusOid === hakemusOid,
      ) ??
      s.context.pistetiedot.find(
        (p: { hakemusOid: string }) => p.hakemusOid === hakemusOid,
      );
    const machineKoe = pistetieto?.valintakokeenPisteet.find(
      (p: { tunniste: string }) => p.tunniste === koeTunniste,
    );
    return {
      arvo: machineKoe.arvo,
      osallistuminen: machineKoe.osallistuminen,
    };
  });
};

export const useIsDirty = (pistesyottoActorRef: AnyActorRef) =>
  useSelector(
    pistesyottoActorRef,
    (s) => s.context.changedPistetiedot.length !== 0,
  );
