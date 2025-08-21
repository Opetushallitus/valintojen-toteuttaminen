import { assign, createMachine, fromPromise, PromiseActorLogic } from 'xstate';
import { JarjestyskriteeriParams } from '../types/jarjestyskriteeri-types';
import { LaskennanJonosijaTulos } from '@/hooks/useEditableValintalaskennanTulokset';
import { commaToPoint } from '../common';
import {
  deleteJonosijanJarjestyskriteeri,
  saveJonosijanJarjestyskriteerit,
} from '../valintalaskenta/valintalaskenta-service';
import useToaster, { Toast } from '@/hooks/useToaster';
import { useActorRef, useSelector } from '@xstate/react';
import { useMemo } from 'react';

export enum MuokattuJonosijaEventTypes {
  ADD = 'ADD',
  SAVE = 'SAVE',
  DELETE = 'DELETE',
}

export enum MuokattuJonosijaState {
  IDLE = 'IDLE',
  SAVING = 'SAVING',
  DELETING = 'DELETING',
}

type MuokattuJonosijaChangeEvent = {
  type: MuokattuJonosijaEventTypes.ADD;
} & JarjestyskriteeriParams;

type MuokattuJonosijaSaveEvent = {
  type: MuokattuJonosijaEventTypes.SAVE;
};

type MuokattuJonosijaDeleteEvent = {
  type: MuokattuJonosijaEventTypes.DELETE;
} & { jarjestyskriteeriPrioriteetti: number };

type MuokattuJonosijaContext = {
  jonosija: LaskennanJonosijaTulos;
  changedKriteerit: Array<JarjestyskriteeriParams>;
};

type MuokattuJonosijaEvents =
  | MuokattuJonosijaChangeEvent
  | MuokattuJonosijaSaveEvent
  | MuokattuJonosijaDeleteEvent;

function applyKriteeriChange(
  context: MuokattuJonosijaContext,
  event: MuokattuJonosijaChangeEvent,
): Array<JarjestyskriteeriParams> {
  const originalKriteeri = context.jonosija.jarjestyskriteerit?.find(
    (k) => k.prioriteetti === event.prioriteetti,
  );
  const existingChangedKriteeri = context.changedKriteerit.find(
    (k) => k.prioriteetti === event.prioriteetti,
  );
  if (
    originalKriteeri?.arvo === commaToPoint(event.arvo) &&
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

function hasChangedKriteerit({
  context,
}: {
  context: MuokattuJonosijaContext;
}) {
  return context.changedKriteerit.length > 0;
}

function isModifiedJonosija({ context }: { context: MuokattuJonosijaContext }) {
  return Boolean(context.jonosija.muokattu);
}

function createMuokattuJonosijaMachine(
  valintatapajonoOid: string,
  jonosija: LaskennanJonosijaTulos,
  addToast: (toast: Toast) => void,
) {
  return createMachine({
    id: `muokattujonosija-${valintatapajonoOid}-hakemus-${jonosija.hakemusOid}`,
    initial: MuokattuJonosijaState.IDLE,
    types: {} as {
      context: MuokattuJonosijaContext;
      events: MuokattuJonosijaEvents;
      actions:
        | { type: 'alert'; params: { message: string } }
        | { type: 'successNotify'; params: { message: string } };
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
    context: {
      jonosija,
      changedKriteerit: new Array<JarjestyskriteeriParams>(),
    },
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
                type: 'alert',
                params: { message: 'virhe.eimuutoksia' },
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
                type: 'alert',
                params: { message: 'valintalaskenta.muokkaus.ei-muokkausta' },
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
            valintatapajonoOid,
          }),
          onDone: {
            target: MuokattuJonosijaState.IDLE,
            actions: [
              {
                type: 'successNotify',
                params: { message: 'valintalaskenta.muokkaus.save-success' },
              },
            ],
          },
          onError: {
            target: MuokattuJonosijaState.IDLE,
            actions: [
              {
                type: 'alert',
                params: { message: 'valintalaskenta.muokkaus.save-error' },
              },
            ],
          },
        },
      },
      [MuokattuJonosijaState.DELETING]: {
        invoke: {
          src: 'delete',
          input: ({ context, event }) => ({
            jarjestyskriteeriPrioriteetti: (
              event as MuokattuJonosijaDeleteEvent
            ).jarjestyskriteeriPrioriteetti,
            hakemusOid: context.jonosija.hakemusOid,
            valintatapajonoOid,
          }),
          onDone: {
            target: MuokattuJonosijaState.IDLE,
            actions: [
              {
                type: 'successNotify',
                params: { message: 'valintalaskenta.muokkaus.delete-success' },
              },
            ],
          },
          onError: {
            target: MuokattuJonosijaState.IDLE,
            actions: [
              {
                type: 'alert',
                params: { message: 'valintalaskenta.muokkaus.delete-error' },
              },
            ],
          },
        },
      },
    },
  }).provide({
    guards: { hasChangedKriteerit, isModifiedJonosija },
    actions: {
      alert: ({ context }, params) =>
        addToast({
          key: `muokattu-jonosija-update-failed-for-${context.jonosija.hakemusOid}-${valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),
      successNotify: ({ context }, params) => {
        addToast({
          key: `muokattu-jonosija-updated-for-${context.jonosija.hakemusOid}-${valintatapajonoOid}`,
          message: params.message,
          type: 'success',
        });
      },
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
}

export const useMuokattuJonosijaActorRef = ({
  valintatapajonoOid,
  jonosija,
}: {
  valintatapajonoOid: string;
  jonosija: LaskennanJonosijaTulos;
}) => {
  const { addToast } = useToaster();
  const machine = useMemo(() => {
    return createMuokattuJonosijaMachine(
      valintatapajonoOid,
      jonosija,
      addToast,
    );
  }, [valintatapajonoOid, jonosija, addToast]);
  const actorRef = useActorRef(machine);
  const snapshot = useSelector(actorRef, (s) => s);
  //const isDirty = useIsJonoTulosDirty(actorRef);
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
    //isDirty,
  };
};
