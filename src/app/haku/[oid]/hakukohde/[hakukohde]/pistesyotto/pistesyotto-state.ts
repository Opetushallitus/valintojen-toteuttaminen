import { Toast } from '@/app/hooks/useToaster';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminen,
} from '@/app/lib/types/laskenta-types';
import { updateScoresForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { assign, fromPromise, setup } from 'xstate';

export type PisteSyottoContext = {
  pistetiedot: HakemuksenPistetiedot[];
  changedPistetiedot: HakemuksenPistetiedot[];
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
  return setup({
    types: {
      context: {
        pistetiedot: [],
        changedPistetiedot: [],
      } as PisteSyottoContext,
    },
    guards: {
      hasChangedPistetiedot: ({ context }) =>
        context.changedPistetiedot.length > 0,
    },
    actions: {
      //eslint-disable-next-line no-empty-pattern
      alert: ({}, params: { message: string }) => {
        addToast({
          key: `pistetiedot-update-failed-for-${hakukohdeOid}`,
          message: params.message,
          type: 'error',
        });
      },
    },
    actors: {
      updatePistetiedot: fromPromise(
        ({ input }: { input: HakemuksenPistetiedot[] }) => {
          return updateScoresForHakukohde(hakuOid, hakukohdeOid, input);
        },
      ),
    },
  }).createMachine({
    id: `PistesyottoMachine-${hakukohdeOid}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot: pistetiedot,
      changedPistetiedot: [],
    },
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
                      event.value as ValintakoeOsallistuminen;
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
        always: [{ target: PisteSyottoStates.IDLE }],
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
          () => {
            const key = `pistetiedot-updated-for-${hakukohdeOid}`;
            const message = 'pistesyotto.valmis';
            addToast({ key, message, type: 'success' });
          },
        ],
      },
    },
  });
};
