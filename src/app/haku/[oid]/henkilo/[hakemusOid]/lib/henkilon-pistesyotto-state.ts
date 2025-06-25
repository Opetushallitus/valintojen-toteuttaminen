import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/lib/types/laskenta-types';
import { updatePisteetForHakemus } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { clone, indexBy, isEmpty, isNonNullish, isNumber, prop } from 'remeda';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { commaToPoint } from '@/lib/common';
import { GenericEvent } from '@/lib/common';

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

export type HenkilonPistesyottoActorRef = ActorRefFrom<
  ReturnType<typeof createHenkilonPisteSyottoMachine>
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

  const pistetieto = clone(existingPistetieto);

  const koe = clone(
    changedPistetieto?.valintakokeenPisteet?.find(
      (k) => k.tunniste === event.koeTunniste,
    ) ?? existingKoe,
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
      koe.arvo = newArvo ?? koe.arvo;
    }

    if (changedPistetieto) {
      let newPisteet = clone(changedPistetieto.valintakokeenPisteet);

      // muuttunut kokeen pistetieto sama kuin alkuperäinen
      if (isKoeValuesEqual(existingKoe, koe)) {
        newPisteet = newPisteet?.filter(
          (p) => p.tunniste !== event.koeTunniste,
        );
      } else {
        if (newPisteet.find((p) => p.tunniste === event.koeTunniste)) {
          // löytyi muuttuneet kokeen pisteet, vaihdetaan
          newPisteet = newPisteet.map((p) =>
            p.tunniste === event.koeTunniste ? koe : p,
          );
        } else {
          // ei muuttuneita pisteitä kokeelle, lisätään
          newPisteet = [...newPisteet, koe];
        }
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
      pistetieto.valintakokeenPisteet = [koe];
      return [...context.changedPistetiedot, pistetieto];
    }
  }
  return context.changedPistetiedot;
};

const mergePistetiedot = (context: PisteSyottoContext) => {
  return context.pistetiedot.map((p) => {
    const changePistetieto = context.changedPistetiedot.find(
      (c) => c.hakemusOid === p.hakemusOid,
    );
    return {
      ...p,
      valintakokeenPisteet: p.valintakokeenPisteet.map((koe) => {
        return (
          changePistetieto?.valintakokeenPisteet.find(
            (changedKoe) => changedKoe.tunniste === koe.tunniste,
          ) ?? koe
        );
      }),
    };
  });
};

export const createHenkilonPisteSyottoMachine = (
  hakemusOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
  valintakokeet: Array<ValintakoeAvaimet>,
  onEvent: (event: GenericEvent) => void,
) => {
  const kokeetByTunniste = indexBy(valintakokeet, prop('tunniste'));
  return createMachine({
    id: `HenkiloPistesyottoMachine-${hakemusOid}`,
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
          input: ({ context }) => mergePistetiedot(context),
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
        context.changedPistetiedot.length === 0,
      hasInvalidPisteet: ({ context }) =>
        isNonNullish(
          context.changedPistetiedot
            .flatMap((pt) => pt.valintakokeenPisteet)
            .find((p) => {
              const arvo = commaToPoint(p.arvo);
              const matchingKoe = context.kokeetByTunniste[p.tunniste];
              const maxVal =
                isNonNullish(matchingKoe?.max) &&
                Number.parseFloat(matchingKoe.max);
              const minVal =
                isNonNullish(matchingKoe?.min) &&
                Number.parseFloat(matchingKoe.min);
              const invalid: boolean =
                (isNumber(minVal) &&
                  (isNaN(Number(arvo)) || (minVal as number) > Number(arvo))) ||
                (isNumber(maxVal) &&
                  (isNaN(Number(arvo)) || (maxVal as number) < Number(arvo)));
              return invalid;
            }),
        ),
    },
    actions: {
      alert: (_, params) =>
        onEvent({
          key: `pistetiedot-update-failed-for-${hakemusOid}`,
          message: (params as { message: string }).message,
          type: 'error',
        }),
      successNotify: () =>
        onEvent({
          key: `pistetiedot-updated-for-${hakemusOid}`,
          message: 'pistesyotto.valmis',
          type: 'success',
        }),
    },
    actors: {
      updatePistetiedot: fromPromise(
        ({ input }: { input: Array<HakemuksenPistetiedot> }) => {
          return updatePisteetForHakemus(hakemusOid, input);
        },
      ),
    },
  });
};

type HenkiloPistesyottoMachineParams = {
  hakemusOid: string;
  pistetiedot: Array<HakemuksenPistetiedot>;
  valintakokeet: Array<ValintakoeAvaimet>;
  onEvent: (event: GenericEvent) => void;
};

export const useHenkilonPistesyottoState = ({
  hakemusOid,
  pistetiedot,
  valintakokeet,
  onEvent,
}: HenkiloPistesyottoMachineParams) => {
  const machine = useMemo(() => {
    return createHenkilonPisteSyottoMachine(
      hakemusOid,
      pistetiedot,
      valintakokeet,
      onEvent,
    );
  }, [hakemusOid, pistetiedot, valintakokeet, onEvent]);

  const actorRef = useActorRef(machine);
  return usePistesyottoActorRef(actorRef);
};

export const usePistesyottoActorRef = (
  actorRef: HenkilonPistesyottoActorRef,
) => {
  const snapshot = useSelector(actorRef, (s) => s);
  const isDirty = useIsDirty(actorRef);

  const onKoeChange = useCallback(
    (params: PistesyottoChangeParams) => {
      actorRef.send({
        type: PisteSyottoEvent.PISTETIETO_CHANGED,
        ...params,
      });
    },
    [actorRef],
  );

  const savePistetiedot = useCallback(() => {
    actorRef.send({ type: PisteSyottoEvent.UPDATE });
  }, [actorRef]);

  return {
    actorRef,
    snapshot,
    isUpdating: snapshot.matches(PisteSyottoStates.UPDATING),
    onKoeChange,
    savePistetiedot,
    isDirty,
  };
};

export const useKoePistetiedot = (
  pistesyottoActor: HenkilonPistesyottoActorRef,
  { hakemusOid, koeTunniste }: { hakemusOid: string; koeTunniste: string },
) => {
  return useSelector(pistesyottoActor, (s) => {
    let koe = s.context.changedPistetiedot
      .find((p: { hakemusOid: string }) => p.hakemusOid === hakemusOid)
      ?.valintakokeenPisteet.find(
        (p: { tunniste: string }) => p.tunniste === koeTunniste,
      );

    if (!koe) {
      koe = s.context.pistetiedot
        .find((p: { hakemusOid: string }) => p.hakemusOid === hakemusOid)
        ?.valintakokeenPisteet.find(
          (p: { tunniste: string }) => p.tunniste === koeTunniste,
        );
    }
    return {
      arvo: koe?.arvo ?? '',
      osallistuminen: koe?.osallistuminen,
    };
  });
};

export const useIsDirty = (pistesyottoActorRef: HenkilonPistesyottoActorRef) =>
  useSelector(
    pistesyottoActorRef,
    (s) => s.context.changedPistetiedot.length !== 0,
  );
