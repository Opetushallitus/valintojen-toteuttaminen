'use client';

import { ActorRefFrom, assign, fromPromise, setup, SnapshotFrom } from 'xstate';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
} from '@/app/lib/valintaperusteet/valintaperusteet-types';
import { Haku, Hakukohde } from '@/app/lib/kouta/kouta-types';
import {
  getLaskennanSeurantaTiedot,
  getLaskennanYhteenveto,
  kaynnistaLaskenta,
  keskeytaLaskenta,
} from '@/app/lib/valintalaskenta/valintalaskenta-service';
import useToaster, { Toast } from '@/app/hooks/useToaster';
import {
  LaskentaSummary,
  LaskentaStart,
  SeurantaTiedot,
  LaskentaErrorSummary,
} from '@/app/lib/types/laskenta-types';
import { prop } from 'remeda';
import { useMemo } from 'react';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta/kouta-service';
import { useMachine, useSelector } from '@xstate/react';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit/ohjausparametrit-types';

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

export type LaskentaStateTags =
  | 'stopped'
  | 'started'
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
    // Laskennan yhteenveto
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
          return kaynnistaLaskenta({
            haku: input.haku,
            hakukohteet: input.hakukohteet,
            valinnanvaiheTyyppi: input.valinnanvaiheTyyppi,
            sijoitellaankoHaunHakukohteetLaskennanYhteydessa:
              input.sijoitellaanko,
            valinnanvaihe: input.valinnanvaiheNumber,
          });
        },
      ),
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
          },
          [LaskentaState.COMPLETED_WITH_ERRORS]: {
            id: LaskentaState.COMPLETED_WITH_ERRORS,
            tags: ['completed'],
          },
          [LaskentaState.COMPLETED]: {
            id: LaskentaState.COMPLETED,
            tags: ['completed'],
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
              // TODO: Poista errorSummary, kun virheiden esittäminen on yhdenmukaistettu myös "valinnan hallinta"-näkymässä
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
                const hakukohteitaYhteensa =
                  context.seurantaTiedot?.hakukohteitaYhteensa ?? 0;

                const hakukohteitaValmiina =
                  event.output?.hakukohteet?.filter(
                    (hk) => hk.tila === 'VALMIS',
                  )?.length ?? 0;
                const hakukohteitaKeskeytetty =
                  hakukohteitaYhteensa - hakukohteitaValmiina;
                const tila = event.output.tila ?? context?.seurantaTiedot?.tila;

                return context.seurantaTiedot
                  ? {
                      ...context.seurantaTiedot,
                      tila,
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

  return useMachine(laskentaMachine);
};

export const useLaskentaError = (actorRef: LaskentaActorRef) => {
  const error = useSelector(actorRef, (state) => state.context.error);
  const laskenta = useSelector(actorRef, (state) => state.context.laskenta);
  const hasError = laskenta.errorMessage != null || error;

  return hasError
    ? (laskenta.errorMessage ?? '' + (error?.message ?? error))
    : '';
};
