import { Toast } from '@/app/hooks/useToaster';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import { updatePisteetForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { useSelector } from '@xstate/react';
import { useMemo } from 'react';
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
                let hakenut = context.changedPistetiedot.find(
                  (h) => h.hakemusOid === event.hakemusOid,
                );
                const changedPisteetExists: boolean = Boolean(hakenut);
                hakenut =
                  hakenut ||
                  context.pistetiedot.find(
                    (h) => h.hakemusOid === event.hakemusOid,
                  );
                const koe = hakenut?.valintakokeenPisteet.find(
                  (k) => k.tunniste === event.koeTunniste,
                );
                if (hakenut && koe) {
                  koe.arvo = event.arvo ?? koe.arvo;
                  koe.osallistuminen =
                    event.osallistuminen ?? koe.osallistuminen;
                  if (changedPisteetExists) {
                    return context.changedPistetiedot.map((h) =>
                      h.hakemusOid === event.hakemusOid ? hakenut : h,
                    );
                  } else {
                    return [...context.changedPistetiedot, hakenut];
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

export const usePistesyottoMachine = ({
  hakuOid,
  hakukohdeOid,
  pistetiedot,
  addToast,
}: PistesyottoMachineParams) => {
  return useMemo(() => {
    return createPisteSyottoMachine(
      hakuOid,
      hakukohdeOid,
      pistetiedot,
      addToast,
    );
  }, [hakuOid, hakukohdeOid, pistetiedot, addToast]);
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
