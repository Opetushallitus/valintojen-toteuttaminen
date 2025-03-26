'use client';

import { ActorRefFrom, assign, fromPromise, setup, SnapshotFrom } from 'xstate';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
  ValintaryhmaHakukohteilla,
} from '@/lib/valintaperusteet/valintaperusteet-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import {
  getLaskennanSeurantaTiedot,
  getLaskennanYhteenveto,
  kaynnistaLaskenta,
  keskeytaLaskenta,
} from '@/lib/valintalaskenta/valintalaskenta-service';
import useToaster, { Toast } from '@/hooks/useToaster';
import {
  LaskentaSummary,
  LaskentaStart,
  SeurantaTiedot,
} from '@/lib/types/laskenta-types';
import { isEmpty, isNumber, prop } from 'remeda';
import { useCallback, useMemo } from 'react';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/lib/kouta/kouta-service';
import { useMachine, useSelector } from '@xstate/react';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { useTranslations } from '@/lib/localization/useTranslations';

const POLLING_INTERVAL = 5000;

export type Laskenta = {
  errorMessage?: string | Array<string> | null;
  calculatedTime?: Date | number | null;
  runningLaskenta?: LaskentaStart;
};

export type LaskentaParams = {
  haku: Haku;
  hakukohteet: Array<Hakukohde> | null;
  valintaryhma?: ValintaryhmaHakukohteilla;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaanko: boolean;
  valinnanvaiheNumber?: number;
  valinnanvaiheNimi?: string;
};

export type LaskentaContext = {
  laskenta: Laskenta;
  canceling: boolean;
  oldLaskentaParams?: LaskentaParams;
  startLaskentaParams?: LaskentaParams;
  seurantaTiedot: SeurantaTiedot | null;
  /**
   * Laskennan yhteenveto, jos laskenta saatiin päätökseen
   */
  summary: LaskentaSummary | null;
  /**
   * Virhe-olio, jos laskennassa tai sen pyynnöissä tapahtui virhe
   */
  error: Error | null;
};

export enum LaskentaState {
  IDLE = 'IDLE',
  INITIALIZED = 'INITIALIZED',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  STARTING = 'STARTING',
  PROCESSING = 'PROCESSING',
  PROCESSING_FETCHING = 'FETCHING',
  PROCESSING_WAITING = 'WAITING',
  PROCESSING_DETERMINE_POLL_COMPLETION = 'DETERMINE_POLL_COMPLETION',
  FETCHING_SUMMARY = 'FETCHING_SUMMARY',
  DETERMINE_SUMMARY = 'DETERMINE_SUMMARY',
  // Laskennassa tai sen pyynnöissä tapahtui virhe, eikä laskenta siksi valmistunut
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
  CANCELING = 'CANCELING',
}

export const enum LaskentaEventType {
  SET_PARAMS = 'SET_PARAMS',
  START = 'START',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  RESET_RESULTS = 'RESET_RESULTS',
}

export type LaskentaEvent =
  | {
      type: 'START' | 'CONFIRM' | 'CANCEL' | 'RESET_RESULTS';
    }
  | SetLaskentaParamsEvent;

export type SetLaskentaParamsEvent = {
  type: LaskentaEventType.SET_PARAMS;
  params: LaskentaParams;
};

export type LaskentaStateTags = 'stopped' | 'started' | 'completed' | 'error';

export type LaskentaMachineSnapshot = SnapshotFrom<
  ReturnType<typeof createLaskentaMachine>
>;

export type LaskentaActorRef = ActorRefFrom<
  ReturnType<typeof createLaskentaMachine>
>;

const hasUnfinishedHakukohteet = (context: LaskentaContext) =>
  isNumber(context.seurantaTiedot?.hakukohteitaKeskeytetty) &&
  context.seurantaTiedot.hakukohteitaKeskeytetty > 0;

const getLaskentaKey = (params?: LaskentaParams) => {
  if (params) {
    if (params.hakukohteet == null) {
      return `haku_${params.haku.oid}`;
    } else {
      const valinnanvaiheSelected: boolean = Boolean(params.valinnanvaiheNimi);

      const keyPartValinnanvaihe = valinnanvaiheSelected
        ? `-valinnanvaihe_${params.valinnanvaiheNumber ?? 0}`
        : '';
      return params.valintaryhma
        ? `haku_${params.haku.oid}-valintaryhma_${params.valintaryhma.oid}`
        : `haku_${params.haku.oid}-hakukohteet_${params.hakukohteet?.map(prop('oid')).join('_')}${keyPartValinnanvaihe}`;
    }
  }
  return '';
};

const initialContext = {
  laskenta: {},
  canceling: false,
  oldLaskentaParams: undefined,
  startLaskentaParams: undefined,
  seurantaTiedot: null,
  // Laskennan yhteenveto
  summary: null,
  // Mahdollinen virheolio. Jos tämä on asetettu, laskenta ei ole valmistunut
  error: null,
};
export const createLaskentaMachine = (addToast: (toast: Toast) => void) => {
  return setup({
    types: {
      context: {} as LaskentaContext,
      tags: 'stopped' as LaskentaStateTags,
      events: {} as LaskentaEvent,
    },
    actors: {
      startLaskenta: fromPromise(({ input }: { input?: LaskentaParams }) => {
        if (!input) {
          return Promise.reject(
            Error('Tried to start laskenta without params'),
          );
        }
        return kaynnistaLaskenta({
          haku: input.haku,
          hakukohteet: input.hakukohteet,
          valintaryhma: input.valintaryhma,
          valinnanvaiheTyyppi: input.valinnanvaiheTyyppi,
          sijoitellaankoHaunHakukohteetLaskennanYhteydessa:
            input.sijoitellaanko,
          valinnanvaiheNumero: input.valinnanvaiheNumber,
        });
      }),
      pollLaskenta: fromPromise(({ input }: { input: Laskenta }) => {
        if (input.runningLaskenta) {
          return getLaskennanSeurantaTiedot(input.runningLaskenta.loadingUrl);
        }
        return Promise.reject(
          Error(
            'Tried to fetch seurantatiedot without having access to started laskenta',
          ),
        );
      }),
      fetchSummary: fromPromise(({ input }: { input: Laskenta }) => {
        if (input.runningLaskenta) {
          return getLaskennanYhteenveto(input.runningLaskenta.loadingUrl);
        }
        return Promise.reject(
          Error('Tried to fetch summary without having access to laskenta'),
        );
      }),
      stopLaskenta: fromPromise(({ input }: { input: Laskenta }) => {
        if (input.runningLaskenta) {
          return keskeytaLaskenta({
            laskentaUuid: input.runningLaskenta.loadingUrl,
          });
        }
        return Promise.reject(
          Error(
            'Failed to stop laskenta without having access to started laskenta',
          ),
        );
      }),
    },
  }).createMachine({
    /** @xstate-layout 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-cKFQPn-3PN8-Bp9uQ-05CoFkgscHKVBU9EyCJtlsNQQFPa3stzNDKLhEK49eiPCdgMd4OCG64qZtlZes1V7zVKuVMJoyiVqOKL4B4FYqjvCSuuD0OFXiHh6iYF0-8TAsqeS9acZNnn8scS2B4FIcHJRqFg7+e4qQAmku8TsuhyzgksRCtOUczZQvNBYXquEgS1mxslNC+jT7aUPFyaSR9cKvH0JY1uK8152pjg65cbheoBxMOCQOfg9AV3XG2XQ65EVzI5IEQIQA */
    id: `LaskentaMachine`,
    initial: LaskentaState.IDLE,
    context: initialContext,
    states: {
      [LaskentaState.IDLE]: {
        tags: ['stopped'],
        initial: LaskentaState.INITIALIZED,
        entry: assign({
          canceling: false,
        }),
        on: {
          [LaskentaEventType.SET_PARAMS]: {
            actions: assign({
              startLaskentaParams: ({ event }) => event.params,
            }),
          },
          [LaskentaEventType.START]: {
            target: LaskentaState.WAITING_CONFIRMATION,
          },
          [LaskentaEventType.RESET_RESULTS]: {
            target: '#INITIALIZED',
            actions: assign(initialContext),
          },
        },
        states: {
          previous: { type: 'history' },
          [LaskentaState.INITIALIZED]: {
            id: LaskentaState.INITIALIZED,
          },
          [LaskentaState.ERROR]: {
            tags: ['error'],
            id: LaskentaState.ERROR,
          },
          [LaskentaState.COMPLETED]: {
            id: LaskentaState.COMPLETED,
            tags: ['completed'],
          },
        },
      },
      [LaskentaState.WAITING_CONFIRMATION]: {
        tags: ['stopped'],
        on: {
          [LaskentaEventType.CONFIRM]: {
            target: LaskentaState.STARTING,
          },
          [LaskentaEventType.CANCEL]: {
            target: 'IDLE.previous',
          },
        },
      },
      [LaskentaState.STARTING]: {
        tags: ['started'],
        entry: assign(({ context }) => ({
          ...initialContext,
          startLaskentaParams: context.startLaskentaParams,
          oldLaskentaParams: context.startLaskentaParams,
        })),
        invoke: {
          src: 'startLaskenta',
          input: ({ context }) => context?.startLaskentaParams,
          onDone: {
            target: LaskentaState.PROCESSING,
            actions: assign({
              laskenta: ({ event, context }) => ({
                ...context.laskenta,
                runningLaskenta: event.output,
              }),
            }),
          },
          onError: {
            target: '#ERROR',
            actions: assign({
              error: ({ event }) => event.error as Error,
            }),
          },
        },
      },
      [LaskentaState.PROCESSING]: {
        tags: ['started'],
        initial: LaskentaState.PROCESSING_FETCHING,
        on: {
          [LaskentaEventType.CANCEL]: '#CANCELING',
        },
        states: {
          [LaskentaState.PROCESSING_FETCHING]: {
            invoke: {
              src: 'pollLaskenta',
              input: ({ context }) => context.laskenta,
              onDone: {
                target: LaskentaState.PROCESSING_DETERMINE_POLL_COMPLETION,
                actions: assign({
                  seurantaTiedot: ({ event }) => event.output,
                }),
              },
              onError: {
                target: '#ERROR',
                actions: assign({
                  error: ({ event }) => event.error as Error,
                }),
              },
            },
          },
          [LaskentaState.PROCESSING_WAITING]: {
            after: {
              [POLLING_INTERVAL]: LaskentaState.PROCESSING_FETCHING,
            },
          },
          [LaskentaState.PROCESSING_DETERMINE_POLL_COMPLETION]: {
            always: [
              {
                guard: ({ context }) =>
                  context.seurantaTiedot?.tila === 'VALMIS' ||
                  context.seurantaTiedot?.tila === 'PERUUTETTU',
                target: '#FETCHING_SUMMARY',
              },
              {
                target: LaskentaState.PROCESSING_WAITING,
              },
            ],
          },
          [LaskentaState.CANCELING]: {
            id: LaskentaState.CANCELING,
            entry: assign({
              canceling: true,
            }),
            invoke: {
              src: 'stopLaskenta',
              input: ({ context }) => context.laskenta,
              onDone: {
                target: '#FETCHING_SUMMARY',
              },
              onError: {
                target: '#ERROR',
                actions: assign({
                  error: ({ event }) => event.error as Error,
                }),
              },
            },
          },
        },
      },
      [LaskentaState.FETCHING_SUMMARY]: {
        tags: ['started'],
        id: LaskentaState.FETCHING_SUMMARY,
        invoke: {
          src: 'fetchSummary',
          input: ({ context }) => context.laskenta,
          onDone: {
            target: '#COMPLETED',
            actions: [
              assign({
                summary: ({ event }) => event.output,
                laskenta: ({ context }) => ({
                  ...context.laskenta,
                  calculatedTime: new Date(),
                }),
                seurantaTiedot: ({ event, context }) => {
                  const hakukohteitaYhteensa =
                    context.seurantaTiedot?.hakukohteitaYhteensa ?? 0;

                  const hakukohteitaValmiina =
                    event.output?.hakukohteet?.filter(
                      (hk) => hk.tila === 'VALMIS',
                    )?.length ?? 0;
                  const hakukohteitaKeskeytetty =
                    hakukohteitaYhteensa - hakukohteitaValmiina;

                  return {
                    ...(context.seurantaTiedot ?? {
                      jonosija: null,
                    }),
                    tila: event.output.tila,
                    hakukohteitaValmiina,
                    hakukohteitaKeskeytetty,
                    hakukohteitaYhteensa,
                  };
                },
              }),
              ({ context }) => {
                if (!hasUnfinishedHakukohteet(context)) {
                  const valinnanvaiheSelected = Boolean(
                    context.startLaskentaParams?.valinnanvaiheNimi,
                  );
                  const key = `laskenta-completed-for-${getLaskentaKey(
                    context.startLaskentaParams,
                  )}`;
                  const message = valinnanvaiheSelected
                    ? 'valinnanhallinta.valmisvalinnanvaihe'
                    : 'valinnanhallinta.valmis';
                  const messageParams = valinnanvaiheSelected
                    ? {
                        nimi:
                          context.startLaskentaParams?.valinnanvaiheNimi ?? '',
                      }
                    : undefined;
                  addToast({ key, message, type: 'success', messageParams });
                }
              },
            ],
          },
          onError: {
            target: '#ERROR',
            actions: assign({
              error: ({ event }) => event.error as Error,
            }),
          },
        },
      },
    },
  });
};

/**
 * Jos hakukohteet == null ja:
 * - valintakoelaskenta=false tai undefined, valinnanvaiheNumber=-1 -> vain tavallinen valintalaskenta haulle
 * - valintakoelaskenta=false tai undefined, valinnanvaiheNumber=undefined -> valintalaskenta ja valintakoelaskenta haulle
 * - valinnanvaiheNumber positiivinen kokonaisluku -> valintakoelaskenta valinnanvaiheelle
 * - valintakoelaskenta=true, valinnanvaiheNumber=undefined -> valintakoelaskenta haulle
 */
type LaskentaStartParams = {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Hakukohde | Array<Hakukohde> | null; // Jos null, suoritetaan laskenta koko haulle
  vaihe?: Valinnanvaihe;
  valinnanvaiheNumber?: number;
  valintaryhma?: ValintaryhmaHakukohteilla;
  valintakoelaskenta?: boolean;
};

const laskentaStateParamsToMachineParams = ({
  haku,
  haunAsetukset,
  hakukohteet,
  vaihe,
  valinnanvaiheNumber,
  valintaryhma,
  valintakoelaskenta,
}: LaskentaStartParams): LaskentaParams => {
  return {
    haku,
    valintaryhma,
    hakukohteet:
      Array.isArray(hakukohteet) || hakukohteet == null
        ? hakukohteet
        : [hakukohteet],
    sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
      haku,
      haunAsetukset,
    ),
    valinnanvaiheNumber,
    ...(valintakoelaskenta
      ? {
          valinnanvaiheTyyppi: ValinnanvaiheTyyppi.VALINTAKOE,
        }
      : {}),
    ...(vaihe && valinnanvaiheNumber
      ? {
          valinnanvaiheTyyppi: vaihe.tyyppi,
          valinnanvaiheNimi: vaihe.nimi,
        }
      : {}),
  };
};

const useLaskentaMachine = () => {
  const { addToast } = useToaster();

  const laskentaMachine = useMemo(() => {
    return createLaskentaMachine(addToast);
  }, [addToast]);

  return useMachine(laskentaMachine);
};

const selectIsLaskentaResultVisible = (state: LaskentaMachineSnapshot) =>
  state.hasTag('stopped') &&
  (!isEmpty(state.context.laskenta) || state.context.error);

export const useLaskentaApi = (actorRef: LaskentaActorRef) => {
  const { send } = actorRef;

  return {
    state: useSelector(actorRef, (s) => s),
    actorRef,
    isLaskentaResultVisible: useSelector(
      actorRef,
      selectIsLaskentaResultVisible,
    ),
    isCanceling: useSelector(actorRef, (state) => state.context.canceling),
    setLaskentaParams: useCallback(
      (params: LaskentaStartParams) => {
        send({
          type: LaskentaEventType.SET_PARAMS,
          params: laskentaStateParamsToMachineParams(params),
        });
      },
      [send],
    ),
    resetLaskenta: useCallback(
      () => send({ type: LaskentaEventType.RESET_RESULTS }),
      [send],
    ),
    confirmLaskenta: useCallback(
      () => send({ type: LaskentaEventType.CONFIRM }),
      [send],
    ),
    cancelLaskenta: useCallback(
      () => send({ type: LaskentaEventType.CANCEL }),
      [send],
    ),
    stopLaskenta: useCallback(
      () => send({ type: LaskentaEventType.CANCEL }),
      [send],
    ),
    startLaskenta: useCallback(
      () => send({ type: LaskentaEventType.START }),
      [send],
    ),
    startLaskentaWithParams: useCallback(
      (params: LaskentaStartParams) => {
        send({
          type: LaskentaEventType.SET_PARAMS,
          params: laskentaStateParamsToMachineParams(params),
        });
        send({
          type: LaskentaEventType.START,
        });
      },
      [send],
    ),
  };
};

export const useLaskentaState = () => {
  const [, , actorRef] = useLaskentaMachine();
  return useLaskentaApi(actorRef);
};

export const useLaskentaTitle = (actorRef: LaskentaActorRef) => {
  const params = useSelector(
    actorRef,
    (state) => state.context.oldLaskentaParams,
  );

  if (params?.hakukohteet == null) {
    if (params?.valinnanvaiheTyyppi === ValinnanvaiheTyyppi.VALINTAKOE) {
      return 'yhteisvalinnan-hallinta.valintakoelaskenta-haulle';
    } else if (params?.valinnanvaiheNumber === -1) {
      return 'yhteisvalinnan-hallinta.valintalaskenta-haulle';
    } else {
      return 'yhteisvalinnan-hallinta.kaikki-laskennat-haulle';
    }
  }
  return 'valintalaskenta.valintalaskenta';
};

export const useLaskentaError = (actorRef: LaskentaActorRef) => {
  const { error, isErrorVisible, withUnfinishedHakukohteet, summaryMessage } =
    useSelector(actorRef, (state) => ({
      isErrorVisible: selectIsLaskentaResultVisible(state),
      laskenta: state.context.laskenta,
      error: state.context.error,
      withUnfinishedHakukohteet: hasUnfinishedHakukohteet(state.context),
      summaryMessage: state.context.summary?.ilmoitus?.otsikko,
    }));

  const { t } = useTranslations();
  const completionErrorsMessage = withUnfinishedHakukohteet
    ? t('valintalaskenta.valintalaskenta-valmis-virheita')
    : null;

  return isErrorVisible
    ? (error?.message ?? summaryMessage ?? completionErrorsMessage ?? undefined)
    : undefined;
};
