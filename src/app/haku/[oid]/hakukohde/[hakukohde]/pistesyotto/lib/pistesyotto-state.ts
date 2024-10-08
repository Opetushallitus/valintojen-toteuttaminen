import { Toast } from '@/app/hooks/useToaster';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import { updatePisteetForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { assign, createMachine, fromPromise } from 'xstate';

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

export enum PisteSyottoEvents {
  UPDATE = 'UPDATE',
  ADD_CHANGED_PISTETIETO = 'ADD_CHANGED_PISTETIETO',
}

export const createPisteSyottoMachine = (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: HakemuksenPistetiedot[],
  addToast: (toast: Toast) => void,
) => {
  const pisteMachine = createMachine({
    id: `PistesyottoMachine-${hakukohdeOid}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot: pistetiedot,
      changedPistetiedot: [],
    } as PisteSyottoContext,
    states: {
      [PisteSyottoStates.IDLE]: {
        on: {
          [PisteSyottoEvents.ADD_CHANGED_PISTETIETO]: {
            actions: assign({
              changedPistetiedot: ({ context, event }) => {
                let hakenut = context.changedPistetiedot.find(
                  (h) => h.hakemusOid === event.hakemusOid,
                );
                const existing: boolean = Boolean(hakenut);
                hakenut =
                  hakenut ||
                  context.pistetiedot.find(
                    (h) => h.hakemusOid === event.hakemusOid,
                  );
                const koe = hakenut?.valintakokeenPisteet.find(
                  (k) => k.tunniste === event.koeTunniste,
                );
                if (hakenut && koe) {
                  if (event.updateArvo) {
                    koe.arvo = event.value;
                  } else {
                    koe.osallistuminen =
                      event.value as ValintakoeOsallistuminenTulos;
                  }
                  if (existing) {
                    return context.changedPistetiedot.map((h) =>
                      h.hakemusOid === event.hakemusOid ? hakenut : h,
                    );
                  } else {
                    return [...context.changedPistetiedot, ...[hakenut]];
                  }
                }
                return context.changedPistetiedot;
              },
            }),
          },
          [PisteSyottoEvents.UPDATE]: [
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
  });

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
      updatePistetiedot: fromPromise(
        ({ input }: { input: HakemuksenPistetiedot[] }) => {
          return updatePisteetForHakukohde(hakuOid, hakukohdeOid, input);
        },
      ),
    },
  });
};
