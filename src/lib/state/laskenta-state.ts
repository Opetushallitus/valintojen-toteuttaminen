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
  StartedLaskentaInfo,
  SeurantaTiedot,
} from '@/lib/types/laskenta-types';
import { isNumber } from 'remeda';
import { useCallback, useMemo } from 'react';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/lib/kouta/kouta-service';
import { useMachine, useSelector } from '@xstate/react';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { useTranslations } from '@/lib/localization/useTranslations';

const POLLING_INTERVAL = 5000;

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
  /**
   * Käynnistetyn laskennan tiedot. Asetetaan laskennan käynnistyksen yhteydessä.
   */
  startedLaskenta?: StartedLaskentaInfo;
  /**
   * Milloin laskenta on viimeksi ajettu? Asetetaan laskennan valmistuttua onnistuneesti.
   */
  calculatedTime: Date | number | null;
  /**
   * True kun ollaan keskeyttämässä laskentaa.
   */
  canceling: boolean;
  /**
   * Aiemmin käynnistetyn laskennan parametrit.
   */
  resultLaskentaParams?: LaskentaParams;
  /**
   * Parametrit, joita käytetään seuraavassa laskennassa.
   */
  laskentaParams?: LaskentaParams;
  /**
   * Laskennan seurantatiedot. Asetetaan pollattaessa laskennan tilaa.
   */
  seurantaTiedot: SeurantaTiedot | null;
  /**
   * Laskennan yhteenveto, jos laskenta saatiin päätökseen.
   */
  summary: LaskentaSummary | null;
  /**
   * Mahdollinen virheolio. Jos tämä on asetettu, laskenta ei ole valmistunut
   */
  error: Error | null;
};

export enum LaskentaState {
  IDLE = 'IDLE',
  RESULT = 'RESULT',
  NO_RESULT = 'NO_RESULT',
  CONFIRMATION = 'CONFIRMATION',
  CONFIRMATION_VISIBLE = 'CONFIRMATION_VISIBLE',
  CONFIRMATION_HIDDEN = 'CONFIRMATION_HIDDEN',
  STARTING = 'STARTING',
  PROCESSING = 'PROCESSING',
  PROCESSING_FETCHING = 'FETCHING',
  PROCESSING_WAITING = 'WAITING',
  PROCESSING_DETERMINE_POLL_COMPLETION = 'DETERMINE_POLL_COMPLETION',
  FETCHING_SUMMARY = 'FETCHING_SUMMARY',
  DETERMINE_SUMMARY = 'DETERMINE_SUMMARY',
  // Laskennassa tai sen pyynnöissä tapahtui virhe, eikä laskenta siksi valmistunut
  ERROR = 'ERROR',
  // Laskenta valmistui, mutta yhteenvedossa voi olla suorittamattomia hakukohteita
  COMPLETED = 'COMPLETED',
  STOPPING = 'STOPPING',
}

export const enum LaskentaEventType {
  SET_PARAMS = 'SET_PARAMS',
  START = 'START',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  RESET_RESULT = 'RESET_RESULT',
}

export type LaskentaEvent =
  | {
      type: 'START' | 'CONFIRM' | 'CANCEL' | 'RESET_RESULT';
    }
  | SetLaskentaParamsEvent;

export type SetLaskentaParamsEvent = {
  type: LaskentaEventType.SET_PARAMS;
  params: LaskentaParams;
};

export type LaskentaMachineSnapshot = SnapshotFrom<
  ReturnType<typeof createLaskentaMachine>
>;

export type LaskentaActorRef = ActorRefFrom<
  ReturnType<typeof createLaskentaMachine>
>;

const hasUnfinishedHakukohteet = (context: LaskentaContext) =>
  isNumber(context.seurantaTiedot?.hakukohteitaKeskeytetty) &&
  context.seurantaTiedot.hakukohteitaKeskeytetty > 0;

const initialContext: LaskentaContext = {
  startedLaskenta: undefined,
  calculatedTime: null,
  canceling: false,
  resultLaskentaParams: undefined,
  laskentaParams: undefined,
  seurantaTiedot: null,
  summary: null,
  error: null,
};

const rejectWithError = (message: string) => Promise.reject(Error(message));

export const createLaskentaMachine = (addToast: (toast: Toast) => void) => {
  return setup({
    types: {
      context: {} as LaskentaContext,
      tags: 'stopped' as
        | 'stopped'
        | 'started'
        | 'completed'
        | 'error'
        | 'waiting-confirmation'
        | 'result',
      events: {} as LaskentaEvent,
    },
    actors: {
      startLaskenta: fromPromise(({ input }: { input?: LaskentaParams }) => {
        return input
          ? kaynnistaLaskenta({
              haku: input.haku,
              hakukohteet: input.hakukohteet,
              valintaryhma: input.valintaryhma,
              valinnanvaiheTyyppi: input.valinnanvaiheTyyppi,
              sijoitellaankoHaunHakukohteetLaskennanYhteydessa:
                input.sijoitellaanko,
              valinnanvaiheNumero: input.valinnanvaiheNumber,
            })
          : rejectWithError('Tried to start laskenta without params');
      }),
      pollLaskenta: fromPromise(
        ({ input }: { input?: StartedLaskentaInfo }) => {
          return input
            ? getLaskennanSeurantaTiedot(input.loadingUrl)
            : rejectWithError(
                'Tried to fetch seurantatiedot without having access to started laskenta',
              );
        },
      ),
      fetchSummary: fromPromise(
        ({ input }: { input?: StartedLaskentaInfo }) => {
          return input
            ? getLaskennanYhteenveto(input.loadingUrl)
            : rejectWithError(
                'Tried to fetch summary without having access to laskenta',
              );
        },
      ),
      stopLaskenta: fromPromise(
        ({ input }: { input?: StartedLaskentaInfo }) => {
          return input
            ? keskeytaLaskenta({
                laskentaUuid: input.loadingUrl,
              })
            : rejectWithError(
                'Failed to stop laskenta without having access to started laskenta',
              );
        },
      ),
    },
  }).createMachine({
    /** @xstate-layout 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-cKFQPn-3PN8-Bp9uQ-05CoFkgscHKVBU9EyCJtlsNQQFPa3stzNDKLhEK49eiPCdgMd4OCG64qZtlZes1V7zVKuVMJoyiVqOKL4B4FYqjvCSuuD0OFXiHh6iYF0-8TAsqeS9acZNnn8scS2B4FIcHJRqFg7+e4qQAmku8TsuhyzgksRCtOUczZQvNBYXquEgS1mxslNC+jT7aUPFyaSR9cKvH0JY1uK8152pjg65cbheoBxMOCQOfg9AV3XG2XQ65EVzI5IEQIQA */
    id: `LaskentaMachine`,
    initial: LaskentaState.IDLE,
    context: initialContext,
    states: {
      [LaskentaState.IDLE]: {
        tags: ['stopped'],
        type: 'parallel',
        entry: assign({
          canceling: false,
        }),
        on: {
          [LaskentaEventType.SET_PARAMS]: {
            actions: assign({
              laskentaParams: ({ event }) => event.params,
            }),
          },
          [LaskentaEventType.RESET_RESULT]: {
            actions: assign(({ context }) => ({
              initialContext,
              laskentaParams: context.laskentaParams,
            })),
            target: '#NO_RESULT',
          },
        },
        states: {
          [LaskentaState.RESULT]: {
            initial: LaskentaState.NO_RESULT,
            states: {
              [LaskentaState.NO_RESULT]: {
                id: LaskentaState.NO_RESULT,
              },
              [LaskentaState.ERROR]: {
                tags: ['error', 'result'],
                id: LaskentaState.ERROR,
              },
              [LaskentaState.COMPLETED]: {
                id: LaskentaState.COMPLETED,
                tags: ['completed', 'result'],
                entry: [
                  ({ context }) => {
                    if (!hasUnfinishedHakukohteet(context)) {
                      const valinnanvaiheSelected = Boolean(
                        context.laskentaParams?.valinnanvaiheNimi,
                      );
                      const message = valinnanvaiheSelected
                        ? 'valinnanhallinta.valmisvalinnanvaihe'
                        : 'valinnanhallinta.valmis';
                      const messageParams = valinnanvaiheSelected
                        ? {
                            nimi:
                              context.laskentaParams?.valinnanvaiheNimi ?? '',
                          }
                        : undefined;
                      addToast({
                        key: 'laskenta-success',
                        message,
                        type: 'success',
                        messageParams,
                      });
                    }
                  },
                ],
              },
            },
          },
          [LaskentaState.CONFIRMATION]: {
            initial: LaskentaState.CONFIRMATION_HIDDEN,
            states: {
              [LaskentaState.CONFIRMATION_HIDDEN]: {
                on: {
                  [LaskentaEventType.START]: {
                    target: [LaskentaState.CONFIRMATION_VISIBLE],
                  },
                },
              },
              [LaskentaState.CONFIRMATION_VISIBLE]: {
                tags: ['waiting-confirmation'],
                on: {
                  [LaskentaEventType.CANCEL]: {
                    target: LaskentaState.CONFIRMATION_HIDDEN,
                  },
                  [LaskentaEventType.CONFIRM]: {
                    target: '#STARTING',
                  },
                },
              },
            },
          },
        },
      },
      [LaskentaState.STARTING]: {
        id: LaskentaState.STARTING,
        tags: ['started'],
        entry: assign(({ context }) => ({
          ...initialContext,
          laskentaParams: context.laskentaParams,
          resultLaskentaParams: context.laskentaParams,
        })),
        invoke: {
          src: 'startLaskenta',
          input: ({ context }) => context?.laskentaParams,
          onDone: {
            target: LaskentaState.PROCESSING,
            actions: assign({
              startedLaskenta: ({ event }) => event.output,
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
          [LaskentaEventType.CANCEL]: '#STOPPING',
        },
        states: {
          [LaskentaState.PROCESSING_FETCHING]: {
            invoke: {
              src: 'pollLaskenta',
              input: ({ context }) => context.startedLaskenta,
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
          [LaskentaState.STOPPING]: {
            id: LaskentaState.STOPPING,
            entry: assign({
              canceling: true,
            }),
            invoke: {
              src: 'stopLaskenta',
              input: ({ context }) => context.startedLaskenta,
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
          input: ({ context }) => context.startedLaskenta,
          onDone: {
            target: '#COMPLETED',
            actions: [
              assign({
                calculatedTime: new Date(),
                summary: ({ event }) => event.output,
                seurantaTiedot: ({ event, context }) => {
                  const hakukohteitaYhteensa =
                    context.seurantaTiedot?.hakukohteitaYhteensa ?? 0;

                  const hakukohteitaValmiina =
                    event.output?.hakukohteet?.filter(
                      (hk) => hk.tila === 'VALMIS',
                    )?.length ?? 0;

                  return {
                    ...(context.seurantaTiedot ?? {
                      jonosija: null,
                    }),
                    tila: event.output.tila,
                    hakukohteitaValmiina,
                    hakukohteitaYhteensa,
                    hakukohteitaKeskeytetty:
                      hakukohteitaYhteensa - hakukohteitaValmiina,
                  };
                },
              }),
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
 * - valinnanvaiheNumber positiivinen kokonaisluku -> valintalaskenta valinnanvaiheelle (ei valintakoe)
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

export const useLaskentaApi = (actorRef: LaskentaActorRef) => {
  const { send } = actorRef;

  return {
    state: useSelector(actorRef, (s) => s),
    actorRef,
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
      () => send({ type: LaskentaEventType.RESET_RESULT }),
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

export const useLaskentaTitle = (
  actorRef: LaskentaActorRef,
  type: 'current' | 'result',
) => {
  const params = useSelector(actorRef, (state) =>
    type === 'current'
      ? state.context.laskentaParams
      : state.context.resultLaskentaParams,
  );

  const { t } = useTranslations();

  if (params?.hakukohteet == null) {
    if (params?.valinnanvaiheTyyppi === ValinnanvaiheTyyppi.VALINTAKOE) {
      return t('yhteisvalinnan-hallinta.valintakoelaskenta-haulle');
    } else if (params?.valinnanvaiheNumber === -1) {
      return t('yhteisvalinnan-hallinta.valintalaskenta-haulle');
    } else {
      return t('yhteisvalinnan-hallinta.kaikki-laskennat-haulle');
    }
  }
  return t('valintalaskenta.valintalaskenta');
};

export const useLaskentaError = (actorRef: LaskentaActorRef) => {
  const { error, isErrorVisible, withUnfinishedHakukohteet, summaryMessage } =
    useSelector(actorRef, (state) => ({
      isErrorVisible: state.hasTag('result'),
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
