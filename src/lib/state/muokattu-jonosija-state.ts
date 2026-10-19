import { assign, createMachine, fromPromise, PromiseActorLogic } from 'xstate';
import { JarjestyskriteeriParams } from '../types/jarjestyskriteeri-types';
import { LaskennanJonosijaTulos } from '@/hooks/useEditableValintalaskennanTulokset';
import {
  deleteJonosijanJarjestyskriteeri,
  saveJonosijanJarjestyskriteerit,
} from '../valintalaskenta/valintalaskenta-service';
import useToaster, { Toast } from '@/hooks/useToaster';
import { useActorRef, useSelector } from '@xstate/react';
import {
  MuokattuJonosijaContext,
  MuokattuJonosijaDeleteEvent,
  MuokattuJonosijaEvents,
  MuokattuJonosijaEventTypes,
  MuokattuJonosijaMachineInput,
  MuokattuJonosijaState,
} from './muokattuJonosijaMachineTypes';
import {
  applyKriteeriChange,
  hasChangedKriteerit,
  isModifiedJonosija,
} from './muokattuJonosijaMachineUtils';
import { inspect } from '@/lib/xstate-utils';

const errorToast = (
  context: MuokattuJonosijaContext,
  message: string,
): Toast => ({
  key: `muokattu-jonosija-update-failed-for-${context.jonosija.hakemusOid}-${context.valintatapajonoOid}`,
  message,
  type: 'error',
});

const successToast = (
  context: MuokattuJonosijaContext,
  message: string,
): Toast => ({
  key: `muokattu-jonosija-updated-for-${context.jonosija.hakemusOid}-${context.valintatapajonoOid}`,
  message,
  type: 'success',
});

export const muokattuJonosijaMachine = createMachine({
  id: 'MuokattuJonosijaMachine',
  initial: MuokattuJonosijaState.IDLE,
  types: {} as {
    context: MuokattuJonosijaContext;
    input: MuokattuJonosijaMachineInput;
    events: MuokattuJonosijaEvents;
    actions: { type: 'notify'; params: Toast } | { type: 'onSuccess' };
    actors:
      | {
          src: 'save';
          logic: PromiseActorLogic<
            void,
            {
              changedKriteerit: Array<JarjestyskriteeriParams>;
              hakemusOid: string;
              valintatapajonoOid: string;
            }
          >;
        }
      | {
          src: 'delete';
          logic: PromiseActorLogic<
            void,
            {
              hakemusOid: string;
              valintatapajonoOid: string;
              jarjestyskriteeriPrioriteetti: number;
            }
          >;
        };
  },
  context: ({ input }) => ({
    valintatapajonoOid: input.valintatapajonoOid,
    jonosija: input.jonosija,
    changedKriteerit: [],
  }),
  states: {
    [MuokattuJonosijaState.IDLE]: {
      on: {
        [MuokattuJonosijaEventTypes.ADD]: {
          actions: assign({
            changedKriteerit: ({ context, event }) => {
              return applyKriteeriChange(context, event);
            },
          }),
        },
        [MuokattuJonosijaEventTypes.SAVE]: [
          {
            guard: 'hasChangedKriteerit',
            target: MuokattuJonosijaState.SAVING,
          },
          {
            actions: {
              type: 'notify',
              params: ({ context }) => errorToast(context, 'virhe.eimuutoksia'),
            },
          },
        ],
        [MuokattuJonosijaEventTypes.DELETE]: [
          {
            guard: 'isModifiedJonosija',
            target: MuokattuJonosijaState.DELETING,
          },
          {
            actions: {
              type: 'notify',
              params: ({ context }) =>
                errorToast(context, 'valintalaskenta.muokkaus.ei-muokkausta'),
            },
          },
        ],
      },
    },
    [MuokattuJonosijaState.SAVING]: {
      invoke: {
        src: 'save',
        input: ({ context }) => ({
          changedKriteerit: context.changedKriteerit,
          hakemusOid: context.jonosija.hakemusOid,
          valintatapajonoOid: context.valintatapajonoOid,
        }),
        onDone: {
          target: MuokattuJonosijaState.IDLE,
          actions: [
            {
              type: 'notify',
              params: ({ context }) =>
                successToast(context, 'valintalaskenta.muokkaus.save-success'),
            },
            { type: 'onSuccess' },
          ],
        },
        onError: {
          target: MuokattuJonosijaState.IDLE,
          actions: {
            type: 'notify',
            params: ({ context }) =>
              errorToast(context, 'valintalaskenta.muokkaus.save-error'),
          },
        },
      },
    },
    [MuokattuJonosijaState.DELETING]: {
      invoke: {
        src: 'delete',
        input: ({ context, event }) => ({
          jarjestyskriteeriPrioriteetti: (event as MuokattuJonosijaDeleteEvent)
            .jarjestyskriteeriPrioriteetti,
          hakemusOid: context.jonosija.hakemusOid,
          valintatapajonoOid: context.valintatapajonoOid,
        }),
        onDone: {
          target: MuokattuJonosijaState.IDLE,
          actions: [
            {
              type: 'notify',
              params: ({ context }) =>
                successToast(
                  context,
                  'valintalaskenta.muokkaus.delete-success',
                ),
            },
            { type: 'onSuccess' },
          ],
        },
        onError: {
          target: MuokattuJonosijaState.IDLE,
          actions: {
            type: 'notify',
            params: ({ context }) =>
              errorToast(context, 'valintalaskenta.muokkaus.delete-error'),
          },
        },
      },
    },
  },
}).provide({
  guards: { hasChangedKriteerit, isModifiedJonosija },
  actions: {
    // Toteutukset annetaan useMuokattuJonosijaState-hookissa .provide()-kutsulla
    notify: () => {},
    onSuccess: () => {},
  },
  actors: {
    save: fromPromise(async ({ input }) => {
      await saveJonosijanJarjestyskriteerit({
        valintatapajonoOid: input.valintatapajonoOid,
        hakemusOid: input.hakemusOid,
        kriteerit: input.changedKriteerit,
      });
    }),
    delete: fromPromise(async ({ input }) => {
      await deleteJonosijanJarjestyskriteeri({
        valintatapajonoOid: input.valintatapajonoOid,
        hakemusOid: input.hakemusOid,
        jarjestyskriteeriPrioriteetti: input.jarjestyskriteeriPrioriteetti,
      });
    }),
  },
});

export const useMuokattuJonosijaState = ({
  valintatapajonoOid,
  jonosija,
  onSuccess,
}: {
  valintatapajonoOid: string;
  jonosija: LaskennanJonosijaTulos;
  onSuccess: () => void;
}) => {
  const { addToast } = useToaster();

  const actorRef = useActorRef(
    muokattuJonosijaMachine.provide({
      actions: {
        notify: (_, toast) => addToast(toast),
        onSuccess: () => onSuccess(),
      },
    }),
    {
      inspect,
      input: { valintatapajonoOid, jonosija },
    },
  );
  const snapshot = useSelector(actorRef, (s) => s);
  return {
    actorRef,
    snapshot,
    isPending:
      snapshot.matches(MuokattuJonosijaState.SAVING) ||
      snapshot.matches(MuokattuJonosijaState.DELETING),
    onJarjestysKriteeriChange: (params: JarjestyskriteeriParams) => {
      actorRef.send({
        type: MuokattuJonosijaEventTypes.ADD,
        ...params,
      });
    },
    saveKriteerit: () => {
      actorRef.send({ type: MuokattuJonosijaEventTypes.SAVE });
    },
    deleteKriteeri: (jarjestyskriteeriPrioriteetti: number) => {
      actorRef.send({
        type: MuokattuJonosijaEventTypes.DELETE,
        jarjestyskriteeriPrioriteetti: jarjestyskriteeriPrioriteetti,
      });
    },
  };
};
