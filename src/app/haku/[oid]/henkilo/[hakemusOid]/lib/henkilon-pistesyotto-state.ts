import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/lib/types/laskenta-types';
import { updatePisteetForHakemus } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import {
  clone,
  flatMap,
  indexBy,
  isNonNullish,
  isNumber,
  pipe,
  prop,
  uniqueBy,
} from 'remeda';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { commaToPoint, FetchError, GenericEvent } from '@/lib/common';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import {
  isKoeValuesEqual,
  PistesyottoAnyEvent,
  PistesyottoChangedPistetietoEvent,
  PistesyottoChangeParams,
  PisteSyottoEvent,
  PisteSyottoStates,
} from '@/lib/state/pistesyotto-state-common';
import { inspect } from '@/lib/xstate-utils';
import { HenkilonHakukohdeTuloksilla } from './henkilo-page-types';

type HenkilonPisteSyottoContext = {
  hakija: HakijaInfo;
  lastModified?: string;
  pistetiedot: Array<ValintakokeenPisteet>;
  changedPistetiedot: Array<ValintakokeenPisteet>;
  kokeetByTunniste: Record<string, ValintakoeAvaimet>;
  error?: Error | FetchError | null;
};

type HenkilonPistesyottoMachineInput = {
  hakija: HakijaInfo;
  pistetiedot: Array<ValintakokeenPisteet>;
  valintakokeet: Array<ValintakoeAvaimet>;
  lastModified?: string;
};

export type HenkilonPistesyottoActorRef = ActorRefFrom<
  typeof henkilonPisteSyottoMachine
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

const warningEvent = (
  context: HenkilonPisteSyottoContext,
  message: string,
): GenericEvent => ({
  key: `pistetiedot-warning-for-${context.hakija.hakemusOid}`,
  message,
  type: 'error',
});

const saveErrorEvent = (context: HenkilonPisteSyottoContext): GenericEvent => {
  const conflictError =
    context.error instanceof FetchError &&
    context.error.response.status === 412;
  return {
    key: `pistetiedot-update-failed-for-${context.hakija.hakemusOid}`,
    message: conflictError
      ? 'henkilo.virhe.pistesyotto-tallennus-konflikti'
      : 'virhe.tallennus',
    type: 'error',
  };
};

export const henkilonPisteSyottoMachine = createMachine({
  id: 'HenkiloPistesyottoMachine',
  initial: PisteSyottoStates.IDLE,
  context: ({ input }) => ({
    hakija: input.hakija,
    lastModified: input.lastModified,
    pistetiedot: input.pistetiedot,
    changedPistetiedot: [],
    kokeetByTunniste: indexBy(input.valintakokeet, prop('tunniste')),
  }),
  types: {} as {
    context: HenkilonPisteSyottoContext;
    input: HenkilonPistesyottoMachineInput;
    events: PistesyottoAnyEvent;
    actions: { type: 'notify'; params: GenericEvent };
  },
  states: {
    [PisteSyottoStates.IDLE]: {
      always: {},
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
              type: 'notify',
              params: ({ context }) =>
                warningEvent(context, 'virhe.eimuutoksia'),
            },
          },
          {
            guard: 'hasInvalidPisteet',
            target: PisteSyottoStates.IDLE,
            actions: {
              type: 'notify',
              params: ({ context }) =>
                warningEvent(context, 'virhe.tarkistasyote'),
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
        input: ({ context }) => ({
          hakija: context.hakija,
          lastModified: context.lastModified,
          pistetiedot: mergePistetiedot(context),
        }),
        onDone: {
          target: PisteSyottoStates.UPDATE_COMPLETED,
        },
        onError: {
          target: PisteSyottoStates.ERROR,
          actions: assign({
            error: ({ event }) => event.error as Error,
          }),
        },
      },
    },
    [PisteSyottoStates.ERROR]: {
      entry: {
        type: 'notify',
        params: ({ context }) => saveErrorEvent(context),
      },
      always: [
        {
          target: PisteSyottoStates.IDLE,
        },
      ],
      exit: assign({ error: null }),
    },
    [PisteSyottoStates.UPDATE_COMPLETED]: {
      always: [
        {
          target: PisteSyottoStates.IDLE,
          actions: {
            type: 'notify',
            params: ({ context }) => ({
              key: `pistetiedot-updated-for-${context.hakija.hakemusOid}`,
              message: 'pistesyotto.valmis',
              type: 'success',
            }),
          },
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
              (Number.isNaN(Number(arvo)) ||
                (minVal as number) > Number(arvo))) ||
            (isNumber(maxVal) &&
              (Number.isNaN(Number(arvo)) ||
                (maxVal as number) < Number(arvo)));
          return invalid;
        }),
      ),
  },
  actions: {
    // Toteutus annetaan useHenkilonPistesyottoState-hookissa .provide()-kutsulla
    notify: () => {},
  },
  actors: {
    updatePistetiedot: fromPromise(
      ({
        input,
      }: {
        input: {
          hakija: HakijaInfo;
          lastModified?: string;
          pistetiedot: Array<ValintakokeenPisteet>;
        };
      }) => {
        return updatePisteetForHakemus(
          input.hakija,
          input.pistetiedot,
          input.lastModified,
        );
      },
    ),
  },
});

type HenkiloPistesyottoStateParams = {
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
  lastModified?: string;
  onEvent: (event: GenericEvent) => void;
};

export const useHenkilonPistesyottoState = ({
  hakija,
  hakukohteet,
  lastModified,
  onEvent,
}: HenkiloPistesyottoStateParams) => {
  const actorRef = useActorRef(
    henkilonPisteSyottoMachine.provide({
      actions: {
        notify: (_, event) => onEvent(event),
      },
    }),
    {
      inspect,
      input: {
        hakija,
        lastModified,
        pistetiedot: pipe(
          hakukohteet,
          flatMap((hakukohde) => hakukohde.pisteet),
          uniqueBy(prop('tunniste')),
        ),
        valintakokeet: pipe(
          hakukohteet,
          flatMap((hakukohde) => hakukohde.kokeet),
          uniqueBy(prop('tunniste')),
        ),
      },
    },
  );
  return useHenkilonPistesyottoActorRef(actorRef);
};

export const useHenkilonPistesyottoActorRef = (
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
