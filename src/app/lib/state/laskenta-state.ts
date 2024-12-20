'use client';

import { ActorRefFrom, assign, fromPromise, setup, SnapshotFrom } from 'xstate';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import {
  getLaskennanSeurantaTiedot,
  getLaskennanYhteenveto,
  kaynnistaLaskenta,
  keskeytaLaskenta,
} from '@/app/lib/valintalaskenta-service';
import { FetchError } from '@/app/lib/common';
import useToaster, { Toast } from '@/app/hooks/useToaster';
import {
  LaskentaSummary,
  LaskentaStart,
  SeurantaTiedot,
  LaskentaErrorSummary,
} from '@/app/lib/types/laskenta-types';
import { prop } from 'remeda';
import { useMemo } from 'react';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { useSelector } from '@xstate/react';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { useXstateMachine } from '../xstate-utils';

const POLLING_INTERVAL = 5000;

export type Laskenta = {
  errorMessage?: string | string[] | null;
  calculatedTime?: Date | number | null;
  runningLaskenta?: LaskentaStart;
};

const laskentaReducer = (state: Laskenta, action: Laskenta): Laskenta => {
  return Object.assign({}, state, action);
};

export type StartLaskentaParams = {
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaanko: boolean;
  valinnanvaiheNumber?: number;
  valinnanvaiheNimi?: string;
};

export type LaskentaContext = {
  laskenta: Laskenta;
  startLaskentaParams: StartLaskentaParams;
  seurantaTiedot: SeurantaTiedot | null;
  errorSummary: LaskentaErrorSummary | null;
  summary: LaskentaSummary | null;
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
  // Laskenta valmistui, mutta yhteenvedossa on virheitä
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  COMPLETED = 'COMPLETED',
  CANCELING = 'CANCELING',
}

export enum LaskentaEventType {
  START = 'START',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  RESET_RESULTS = 'RESET_RESULTS',
}

export type LaskentaEvent = {
  type: LaskentaEventType;
};

const tryAndParseError = async <T>(wrappedFn: () => Promise<T>) => {
  try {
    return await wrappedFn();
  } catch (e) {
    if (e instanceof FetchError) {
      const message = e.message;
      throw message;
    }
    throw e;
  }
};
export type LaskentaStateTags =
  | 'stopped'
  | 'started'
  | 'finished'
  | 'error'
  | 'completed'
  | 'canceling';

export type LaskentaMachineSnapshot = SnapshotFrom<
  ReturnType<typeof createLaskentaMachine>
>;

export type LaskentaActorRef = ActorRefFrom<
  ReturnType<typeof createLaskentaMachine>
>;

export const createLaskentaMachine = (
  params: StartLaskentaParams,
  addToast: (toast: Toast) => void,
) => {
  const valinnanvaiheSelected: boolean = Boolean(params.valinnanvaiheNimi);
  const keyPartValinnanvaihe = valinnanvaiheSelected
    ? `-valinnanvaihe_${params.valinnanvaiheNumber ?? 0}`
    : '';

  const initialContext = {
    laskenta: {},
    startLaskentaParams: params,
    seurantaTiedot: null,
    summary: null,
    // Laskennan yhteenvedon virheilmoitukset
    errorSummary: null,
    // Mahdollinen virheolio. Huom! errorSummary voi sisältää jotain, vaikka error on null
    error: null,
  };

  const machineKey = `haku_${params.haku.oid}-hakukohteet_${params.hakukohteet.map(prop('oid')).join('_')}${keyPartValinnanvaihe}`;
  return setup({
    types: {
      context: {} as LaskentaContext,
      tags: 'stopped' as LaskentaStateTags,
    },
    actors: {
      startLaskenta: fromPromise(
        ({ input }: { input: StartLaskentaParams }) => {
          return tryAndParseError<LaskentaStart>(async () => {
            return await kaynnistaLaskenta({
              haku: input.haku,
              hakukohteet: input.hakukohteet,
              valinnanvaiheTyyppi: input.valinnanvaiheTyyppi,
              sijoitellaankoHaunHakukohteetLaskennanYhteydessa:
                input.sijoitellaanko,
              valinnanvaihe: input.valinnanvaiheNumber,
            });
          });
        },
      ),
      pollLaskenta: fromPromise(({ input }: { input: Laskenta }) => {
        return tryAndParseError<SeurantaTiedot>(async () => {
          if (input.runningLaskenta) {
            return await getLaskennanSeurantaTiedot(
              input.runningLaskenta.loadingUrl,
            );
          }
          throw 'Tried to fetch seurantatiedot without having access to started laskenta';
        });
      }),
      fetchSummary: fromPromise(({ input }: { input: Laskenta }) => {
        return tryAndParseError<LaskentaSummary>(async () => {
          if (input.runningLaskenta) {
            return getLaskennanYhteenveto(input.runningLaskenta.loadingUrl);
          }
          throw 'Tried to fetch summary without having access to laskenta';
        });
      }),
      stopLaskenta: fromPromise(({ input }: { input: Laskenta }) => {
        if (input.runningLaskenta) {
          return keskeytaLaskenta({
            laskentaUuid: input.runningLaskenta.loadingUrl,
          });
        }
        throw 'Failed to stop laskenta without having access to started laskenta';
      }),
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAZQBUBBAJSYG0AGAXUVAAHAPaxcAF1zD8AkAA9EAJgAcAThLcAjMoDsOgMyrlANlUAWY4oA0IAJ6JlmksZ0BWbtz1HNZ1ToC+-jZoWHiEpJS0dGw0DDRMAPoxDACqVEwMPPxIICJiktKyCgiKmoo6JK5lOi5mrvoqyjb2CDoWJMqepfo1xmbcxoHBGDgExCQA6ixkTGQAcgDiCQDCAPJzAGJkbACyLLPrdGub2ztZsnkSUjI5xYqq6lq6BkamFtZ2iPpmTgbKZnUfqVFMZNAEgiAQqNwpNprNFit1ltdvsyIdliw5ssaFRzjlLgUbqA7g8NNo9IYTOZLM0lFpnAMQVodOUjGYhpCRmFxsx2PCFnQINIwCQCAA3YQAaxFUO5pF5HHmCwQ4uEmHQhKyeKEoiuhVuiFcHxadScoOMrhefR03DM3w5srG8tYisWdDAACcPcIPSRBAAbDUAMx9qBIjphCv5KvwEvVmr42tyusJRUQfW4JH0jh6jjMnXKOlpCDtrmcbVUin0mlUlgsPgdXKdJAACmxVtiGAwlYwmKsW0mCdc0wh6vpKt9S2pHMZlE1PghNB4y4pV-9FAC6q5QY3Qs22x3Yt3FiQNvFlgAJHtCwii2NSmVNmEHzvHhan89XxYxuMa65avgLhTYcDRKPxnD8RQqh6YxuEtfRix0cwSFUBpFGZAFYIsXdoXGF8jyVD8mEvHtPW9X0A2DUNwyfPD21fQiz2Ir9lVVeN-0TQD8WA-ViUQTQBKcbwehZfp-iNYtK1+GsdE0BpXH6e5wWGPdn3ogiTymGYezkWBxA1EV0CDcRPWQdwPCIOgIzow8u0IrT+UHHiiXkBwqxIMplAUgx9DQgxixcYxKiXBoTEnRxVBwuVW3UuyTwoeIaF2eYaASFtVioKhER2FtaAOOY6Cc-IQL4xdBJQnM9A3bhxONRAdDUEgam+I1XC8ytsIhazSHwuL3wSpgkp2FK0oyrK1hyvK0QKzhNGyHVit41zWjcSofltOTuEMIxi0cRQsx+NqygtWCtCi5smJIhFUh2PY2AATUFYU7wlaUaNU8ZLpYhIbru+6fzVP9pAA+bk0Wlzik0bcnCg4xtv0bhSjMDcAoGLNPBkrckeUzkPtIL6lR+lJbvYR6yJ9P1A3EEMPTDbqiKupZftJgH2OBzjQaHJbIehkhYfhxGfBRhdZKChrSgeNp+l886YQGoaRuZh7Cq4ha9Qh-jdGUSoPA3dwTDUcwAv6DzqT0drJ3ZLraNIeXkrmVKlce2bOeckdyW18y9Zq2cHjMYtXFUMtlAaME3Fkp5BmtvGSGYfsW2vZ7VTe+m45bBPvzYoH8BBoDwZHAwzGcWdlBURGQX0C1i2zCpakrataw3UErZU3DnXj0ivQpyjqeo1O+3TpVWez3PuPz0DC+Lucy9XOGq4XXz1DrqsazrZvAghfBhAgOBZG6vP1ZHABaOSPJZbN0NtHotrqhAj7LB5H7cSvTFh5RZfGSIaAP1NQPQpDgrlFqPURo1dfCVDcCHbcUF2quA-hEagNA-QejAGKKQABXeAY9D5-2qIAmobQQFzmLHaCoUEfY1HMG0Qw8DyCIPIHMbSLAqBkAAFo0AoD-Eqy0qz3EqKYRGDQYKoQQiLdo5laxuD6EHLatCv4kCSu2NgCQqAsAYAAaRoHMVgXDuZKDwVUIBhDQrzhaCXLMaFNDGGbjJOB0c250NoLHAeLYOG6I1iUAx1RgEmJIUYPmq8fjWMMJaRQcj6ETVyolTh2Df6lWBBUQxBC6i+IXK4bcEELDZhnFYy0tCHKE2OMiPY+V3Ejm+B0IBYIHjQNrKYpQqgnCI0aekkw6S0K0KjEqMpoE7SZn0OZWSjTGnoVUCQ3yWZ6hLg8DmbwtDepvh6aVQwTVuCQQag8JcWEA5zg6AMgZHhfKzjBPM2Kb4GYsSWctXQqz1mGy2baRCqhMwCS2pXRpcFZL6FObZc5BTFhXOKKhdQ7TtyVxtNmFwAVS5NT+KYSucEBmaB+QxeKiV7apXSplbKUTSmxO4cUMwNQ1rTKgivGqoiWgzlNg1IRgdEYuFoQTa6xM-qAv4nrLM2g5z9DtPs-2Is4bOFXrJKGpdYKRXsdFO2w0HZExJg9dli4LSZmecyVc8kfj1IQBaIuCMhmEKND4HG-cO4AvxXosqDQOiWnSVUEuLhKVKAybaDcc4kLVjglHQIQA */
    id: `LaskentaMachine-${machineKey}`,
    initial: LaskentaState.IDLE,
    context: initialContext,
    states: {
      [LaskentaState.IDLE]: {
        tags: ['stopped'],
        initial: LaskentaState.INITIALIZED,
        on: {
          [LaskentaEventType.START]: {
            target: LaskentaState.WAITING_CONFIRMATION,
          },
          [LaskentaEventType.RESET_RESULTS]: {
            target: '#INITIALIZED',
          },
        },
        states: {
          previous: { type: 'history' },
          [LaskentaState.INITIALIZED]: {
            id: LaskentaState.INITIALIZED,
            actions: assign(initialContext),
          },
          [LaskentaState.ERROR]: {
            id: LaskentaState.ERROR,
            tags: ['error'],
          },
          [LaskentaState.COMPLETED_WITH_ERRORS]: {
            id: LaskentaState.COMPLETED_WITH_ERRORS,
            tags: ['finished', 'error', 'completed'],
          },
          [LaskentaState.COMPLETED]: {
            id: LaskentaState.COMPLETED,
            tags: ['finished', 'completed'],
            entry: [
              assign({
                laskenta: ({ context }) =>
                  laskentaReducer(context.laskenta, {
                    calculatedTime: new Date(),
                  }),
              }),
              ({ context }) => {
                const key = `laskenta-completed-for-${machineKey}`;
                const message = valinnanvaiheSelected
                  ? 'valinnanhallinta.valmisvalinnanvaihe'
                  : 'valinnanhallinta.valmis';
                const messageParams = valinnanvaiheSelected
                  ? {
                      nimi: context.startLaskentaParams.valinnanvaiheNimi ?? '',
                    }
                  : undefined;
                addToast({ key, message, type: 'success', messageParams });
              },
            ],
          },
        },
      },
      [LaskentaState.WAITING_CONFIRMATION]: {
        tags: ['stopped'],
        on: {
          [LaskentaEventType.CONFIRM]: {
            target: LaskentaState.STARTING,
            actions: assign(initialContext),
          },
          [LaskentaEventType.CANCEL]: {
            target: 'IDLE.previous',
          },
        },
      },
      [LaskentaState.STARTING]: {
        tags: ['started'],
        invoke: {
          src: 'startLaskenta',
          input: ({ context }) => context.startLaskentaParams,
          onDone: {
            target: LaskentaState.PROCESSING,
            actions: assign({
              laskenta: ({ event, context }) =>
                laskentaReducer(context.laskenta, {
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
            tags: ['canceling'],
            invoke: {
              src: 'stopLaskenta',
              input: ({ context }) => context.laskenta,
              onDone: {
                target: '#FETCHING_SUMMARY',
              },
              onError: {
                target: '#ERROR',
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
            target: LaskentaState.DETERMINE_SUMMARY,
            actions: assign({
              summary: ({ event }) => event.output,
              // TODO: Poista errorSummary, kun virheiden esittäminen on yhdenmukaistettu myös sijoittelun tulokset näkymässä
              errorSummary: ({ event }) =>
                event.output?.hakukohteet
                  ?.filter((hk) =>
                    hk.ilmoitukset?.some((i) => i.tyyppi === 'VIRHE'),
                  )
                  .map((hakukohde) => {
                    return {
                      hakukohdeOid: hakukohde.hakukohdeOid,
                      notifications: hakukohde.ilmoitukset?.map(
                        (i) => i.otsikko,
                      ),
                    };
                  })[0],
              seurantaTiedot: ({ event, context }) => {
                console.log(event.output);
                console.log(context.errorSummary);

                const hakukohteitaYhteensa =
                  context.seurantaTiedot?.hakukohteitaYhteensa ?? 0;

                const hakukohteitaValmiina =
                  event.output?.hakukohteet?.filter(
                    (hk) => hk.tila === 'VALMIS',
                  )?.length ?? 0;
                const hakukohteitaKeskeytetty =
                  hakukohteitaYhteensa - hakukohteitaValmiina;

                return context.seurantaTiedot
                  ? {
                      ...context.seurantaTiedot,
                      hakukohteitaValmiina:
                        hakukohteitaYhteensa - hakukohteitaKeskeytetty,
                      hakukohteitaKeskeytetty,
                    }
                  : context.seurantaTiedot;
              },
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
      [LaskentaState.DETERMINE_SUMMARY]: {
        tags: ['started'],
        always: [
          {
            guard: ({ context }) =>
              (context.seurantaTiedot != null &&
                context.seurantaTiedot.hakukohteitaKeskeytetty > 0) ||
              (context.errorSummary?.notifications?.length ?? 0) > 0,
            target: '#COMPLETED_WITH_ERRORS',
            actions: assign({
              laskenta: ({ context }) =>
                laskentaReducer(context.laskenta, {
                  errorMessage: context.errorSummary?.notifications,
                }),
            }),
          },
          {
            target: '#COMPLETED',
          },
        ],
      },
    },
  });
};

type LaskentaStateParams = {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Hakukohde | Array<Hakukohde>;
  vaihe?: Valinnanvaihe;
  valinnanvaiheNumber?: number;
  addToast: (toast: Toast) => void;
};

export const useLaskentaState = ({
  haku,
  haunAsetukset,
  hakukohteet,
  vaihe,
  valinnanvaiheNumber,
}: LaskentaStateParams) => {
  const { addToast } = useToaster();

  const laskentaMachine = useMemo(() => {
    return createLaskentaMachine(
      {
        haku,
        hakukohteet: Array.isArray(hakukohteet) ? hakukohteet : [hakukohteet],
        sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
          haku,
          haunAsetukset,
        ),
        ...(vaihe && valinnanvaiheNumber
          ? {
              valinnanvaiheTyyppi: vaihe.tyyppi,
              valinnanvaiheNumber,
              valinnanvaiheNimi: vaihe.nimi,
            }
          : {}),
      },
      addToast,
    );
  }, [haku, hakukohteet, haunAsetukset, vaihe, valinnanvaiheNumber, addToast]);

  return useXstateMachine(laskentaMachine);
};

export const useLaskentaError = (actorRef: LaskentaActorRef) => {
  const error = useSelector(actorRef, (state) => state.context.error);
  const laskenta = useSelector(actorRef, (state) => state.context.laskenta);
  const hasError = laskenta.errorMessage != null || error;

  return hasError ? (laskenta.errorMessage ?? '' + error) : '';
};
