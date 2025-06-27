import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/lib/types/laskenta-types';
import { updatePisteetForHakemus } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { clone, indexBy, isNonNullish, isNumber, prop } from 'remeda';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { commaToPoint } from '@/lib/common';
import { GenericEvent } from '@/lib/common';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import {
  PistesyottoAnyEvent,
  PisteSyottoEvent,
  PisteSyottoStates,
} from '@/lib/state/pistesyotto-state';

type HenkilonPisteSyottoContext = {
  pistetiedot: Array<ValintakokeenPisteet>;
  changedPistetiedot: Array<ValintakokeenPisteet>;
  kokeetByTunniste: Record<string, ValintakoeAvaimet>;
  toastMessage?: string;
};

type HenkilonPistesyottoChangeParams = {
  hakemusOid: string;
  koeTunniste: string;
  arvo?: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
};

type PistesyottoChangedPistetietoEvent = {
  type: PisteSyottoEvent.PISTETIETO_CHANGED;
} & HenkilonPistesyottoChangeParams;

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
  context: HenkilonPisteSyottoContext;
  event: PistesyottoChangedPistetietoEvent;
}) => {
  const changedPistetieto = context.changedPistetiedot.find(
    (h) => h.tunniste === event.koeTunniste,
  );
  const existingPistetieto = context.pistetiedot.find(
    (h) => h.tunniste === event.koeTunniste,
  );

  const pistetieto = clone(existingPistetieto);

  if (pistetieto) {
    const newArvo = event.arvo;
    if (
      newArvo &&
      pistetieto.osallistuminen === ValintakoeOsallistuminenTulos.MERKITSEMATTA
    ) {
      pistetieto.osallistuminen = ValintakoeOsallistuminenTulos.OSALLISTUI;
    } else {
      pistetieto.osallistuminen =
        event.osallistuminen ?? pistetieto.osallistuminen;
    }

    if (
      event.osallistuminen &&
      event.osallistuminen !== ValintakoeOsallistuminenTulos.OSALLISTUI
    ) {
      pistetieto.arvo = '';
    } else {
      pistetieto.arvo = newArvo ?? pistetieto.arvo;
    }

    if (changedPistetieto) {
      // muuttunut kokeen pistetieto sama kuin alkuperäinen
      if (isKoeValuesEqual(existingPistetieto, pistetieto)) {
        return context.changedPistetiedot.filter(
          (p) => p.tunniste !== event.koeTunniste,
        );
      } else {
        return context.changedPistetiedot.map((h) =>
          h.tunniste === event.koeTunniste ? pistetieto : h,
        );
      }
    } else {
      return [...context.changedPistetiedot, pistetieto];
    }
  }
  return context.changedPistetiedot;
};

const mergePistetiedot = (context: HenkilonPisteSyottoContext) => {
  return context.pistetiedot.map((p) => {
    const changePistetieto = context.changedPistetiedot.find(
      (c) => c.tunniste === p.tunniste,
    );
    return changePistetieto ?? p;
  });
};

export const createHenkilonPisteSyottoMachine = (
  hakija: HakijaInfo,
  pistetiedot: Array<ValintakokeenPisteet>,
  valintakokeet: Array<ValintakoeAvaimet>,
  onEvent: (event: GenericEvent) => void,
) => {
  const kokeetByTunniste = indexBy(valintakokeet, prop('tunniste'));
  return createMachine({
    id: `HenkiloPistesyottoMachine-${hakija.hakemusOid}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot,
      changedPistetiedot: [],
      kokeetByTunniste,
    },
    types: {} as {
      context: HenkilonPisteSyottoContext;
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
                  (c) => c.tunniste === p.tunniste,
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
          context.changedPistetiedot.find((p) => {
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
          key: `pistetiedot-update-failed-for-${hakija.hakemusOid}`,
          message: (params as { message: string }).message,
          type: 'error',
        }),
      successNotify: () =>
        onEvent({
          key: `pistetiedot-updated-for-${hakija.hakemusOid}`,
          message: 'pistesyotto.valmis',
          type: 'success',
        }),
    },
    actors: {
      updatePistetiedot: fromPromise(
        ({ input }: { input: Array<ValintakokeenPisteet> }) => {
          return updatePisteetForHakemus(hakija, input);
        },
      ),
    },
  });
};

type HenkiloPistesyottoMachineParams = {
  hakija: HakijaInfo;
  pistetiedot: Array<ValintakokeenPisteet>;
  valintakokeet: Array<ValintakoeAvaimet>;
  onEvent: (event: GenericEvent) => void;
};

export const useHenkilonPistesyottoState = ({
  hakija,
  pistetiedot,
  valintakokeet,
  onEvent,
}: HenkiloPistesyottoMachineParams) => {
  const machine = useMemo(() => {
    return createHenkilonPisteSyottoMachine(
      hakija,
      pistetiedot,
      valintakokeet,
      onEvent,
    );
  }, [pistetiedot, valintakokeet, onEvent, hakija]);

  const actorRef = useActorRef(machine);
  return useHenkilonPistesyottoActorRef(actorRef);
};

export const useHenkilonPistesyottoActorRef = (
  actorRef: HenkilonPistesyottoActorRef,
) => {
  const snapshot = useSelector(actorRef, (s) => s);
  const isDirty = useIsDirty(actorRef);

  const onKoeChange = useCallback(
    (params: HenkilonPistesyottoChangeParams) => {
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

export const useHenkilonKoePistetiedot = (
  pistesyottoActor: HenkilonPistesyottoActorRef,
  { koeTunniste }: { koeTunniste: string },
) => {
  return useSelector(pistesyottoActor, (s) => {
    let koe = s.context.changedPistetiedot.find(
      (p) => p.tunniste === koeTunniste,
    );

    if (!koe) {
      koe = s.context.pistetiedot.find((p) => p.tunniste === koeTunniste);
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
