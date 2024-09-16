'use client';

import { assign, fromPromise, setup } from 'xstate';
import { Laskenta, laskentaReducer } from './valinnan-hallinta-types';
import { ValinnanvaiheTyyppi } from '@/app/lib/types/valintaperusteet-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import {
  getLaskennanTilaHakukohteelle,
  kaynnistaLaskenta,
  kaynnistaLaskentaHakukohteenValinnanvaiheille,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { TranslatedName } from '@/app/lib/localization/localization-types';
import { getLaskennanSeurantaTiedot } from '@/app/lib/valintalaskenta-service';
import { FetchError } from '@/app/lib/common';
import { Toast } from '@/app/hooks/useToaster';
import {
  LaskentaErrorSummary,
  LaskentaStart,
  SeurantaTiedot,
} from '@/app/lib/types/laskenta-types';

const POLLING_INTERVAL = 5000;

export type StartLaskentaParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaanko: boolean;
  valinnanvaiheNumber?: number;
  valinnanvaiheNimi?: string;
  translateEntity: (translateable: TranslatedName) => string;
};

export type LaskentaContext = {
  laskenta: Laskenta;
  startLaskentaParams: StartLaskentaParams;
  seurantaTiedot: SeurantaTiedot | null;
  errorSummary: LaskentaErrorSummary | null;
  error?: Error;
};

export enum LaskentaStates {
  IDLE = 'IDLE',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  STARTING = 'STARTING',
  PROCESSING = 'PROCESSING',
  PROCESSING_FETCHING = 'FETCHING',
  PROCESSING_WAITING = 'WAITING',
  PROCESSING_DETERMINE_POLL_COMPLETION = 'DETERMINE_POLL_COMPLETION',
  FETCHING_SUMMARY = 'FETCHING_SUMMARY',
  DETERMINE_SUMMARY = 'DETERMINE_SUMMARY',
  ERROR_LASKENTA = 'ERROR_LASKENTA',
  COMPLETED = 'COMPLETED',
}

export enum LaskentaEvents {
  START = 'START',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}

const tryAndParseError = async <T>(wrappedFn: () => Promise<T>) => {
  try {
    return await wrappedFn();
  } catch (e) {
    if (e instanceof FetchError) {
      const message = await e.response.text();
      throw message;
    }
    throw e;
  }
};

export const createLaskentaMachine = (
  params: StartLaskentaParams,
  addToast: (toast: Toast) => void,
) => {
  return setup({
    types: {
      context: {} as LaskentaContext,
    },
    actors: {
      startLaskenta: fromPromise(
        ({ input }: { input: StartLaskentaParams }) => {
          return tryAndParseError<LaskentaStart>(async () => {
            if (input.valinnanvaiheTyyppi && input.valinnanvaiheNumber) {
              return await kaynnistaLaskenta(
                input.haku,
                input.hakukohde,
                input.valinnanvaiheTyyppi,
                input.sijoitellaanko,
                input.valinnanvaiheNumber,
                input.translateEntity,
              );
            } else {
              return await kaynnistaLaskentaHakukohteenValinnanvaiheille(
                input.haku,
                input.hakukohde,
                input.sijoitellaanko,
                input.translateEntity,
              );
            }
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
          throw 'Tried to fetch seurantatiedot without having access to running laskenta';
        });
      }),
      fetchSummary: fromPromise(({ input }: { input: Laskenta }) => {
        return tryAndParseError<LaskentaErrorSummary>(async () => {
          if (input.runningLaskenta) {
            return getLaskennanTilaHakukohteelle(
              input.runningLaskenta.loadingUrl,
            );
          }
          throw 'Tried to fetch summary without having access to laskenta';
        });
      }),
    },
  }).createMachine({
    id: `LaskentaMachine-${params.hakukohde.oid}-${params.valinnanvaiheNumber ?? ''}`,
    initial: LaskentaStates.IDLE,
    context: {
      laskenta: {},
      startLaskentaParams: params,
      seurantaTiedot: null,
      errorSummary: null,
    },
    states: {
      [LaskentaStates.IDLE]: {
        on: {
          [LaskentaEvents.START]: {
            target: LaskentaStates.WAITING_CONFIRMATION,
          },
        },
      },
      [LaskentaStates.WAITING_CONFIRMATION]: {
        on: {
          [LaskentaEvents.CONFIRM]: {
            target: LaskentaStates.STARTING,
            actions: assign({
              laskenta: {},
              errorSummary: null,
              seurantaTiedot: null,
              error: undefined,
            }),
          },
          [LaskentaEvents.CANCEL]: {
            target: LaskentaStates.IDLE,
          },
        },
      },
      [LaskentaStates.STARTING]: {
        invoke: {
          src: 'startLaskenta',
          input: ({ context }) => context.startLaskentaParams,
          onDone: {
            target: 'PROCESSING.FETCHING',
            actions: assign({
              laskenta: ({ event, context }) =>
                laskentaReducer(context.laskenta, {
                  runningLaskenta: event.output,
                }),
            }),
          },
          onError: {
            target: LaskentaStates.ERROR_LASKENTA,
            actions: assign({
              error: ({ event }) => event.error as Error,
            }),
          },
        },
      },
      [LaskentaStates.PROCESSING]: {
        initial: LaskentaStates.PROCESSING_FETCHING,
        states: {
          [LaskentaStates.PROCESSING_FETCHING]: {
            invoke: {
              src: 'pollLaskenta',
              input: ({ context }) => context.laskenta,
              onDone: {
                target: LaskentaStates.PROCESSING_DETERMINE_POLL_COMPLETION,
                actions: assign({
                  seurantaTiedot: ({ event }) => event.output,
                }),
              },
              onError: {
                target: '#ERROR_LASKENTA',
                actions: assign({
                  error: ({ event }) => event.error as Error,
                }),
              },
            },
          },
          [LaskentaStates.PROCESSING_WAITING]: {
            after: {
              [POLLING_INTERVAL]: LaskentaStates.PROCESSING_FETCHING,
            },
          },
          [LaskentaStates.PROCESSING_DETERMINE_POLL_COMPLETION]: {
            always: [
              {
                guard: ({ context }) =>
                  context.seurantaTiedot?.tila === 'VALMIS',
                target: '#FETCHING_SUMMARY',
              },
              {
                target: LaskentaStates.PROCESSING_WAITING,
              },
            ],
          },
        },
      },
      [LaskentaStates.FETCHING_SUMMARY]: {
        id: 'FETCHING_SUMMARY',
        invoke: {
          src: 'fetchSummary',
          input: ({ context }) => context.laskenta,
          onDone: {
            target: LaskentaStates.DETERMINE_SUMMARY,
            actions: assign({
              errorSummary: ({ event }) => event.output,
            }),
          },
          onError: {
            target: LaskentaStates.ERROR_LASKENTA,
            actions: assign({
              error: ({ event }) => event.error as Error,
            }),
          },
        },
      },
      [LaskentaStates.DETERMINE_SUMMARY]: {
        always: [
          {
            guard: ({ context }) =>
              (context.seurantaTiedot != null &&
                context.seurantaTiedot.hakukohteitaKeskeytetty > 0) ||
              (context.errorSummary?.notifications?.length ?? 0) > 0,
            target: LaskentaStates.ERROR_LASKENTA,
            actions: assign({
              laskenta: ({ context }) =>
                laskentaReducer(context.laskenta, {
                  errorMessage: context.errorSummary?.notifications,
                }),
            }),
          },
          {
            target: LaskentaStates.COMPLETED,
          },
        ],
      },
      [LaskentaStates.ERROR_LASKENTA]: {
        id: 'ERROR_LASKENTA',
        always: [{ target: LaskentaStates.IDLE }],
      },
      [LaskentaStates.COMPLETED]: {
        always: [{ target: LaskentaStates.IDLE }],
        entry: [
          assign({
            laskenta: ({ context }) =>
              laskentaReducer(context.laskenta, {
                calculatedTime: new Date(),
              }),
          }),
          ({ context }) => {
            const wholeHakukohde: boolean =
              !context.startLaskentaParams.valinnanvaiheNimi;
            const keyPartValinnanvaihe = wholeHakukohde
              ? ''
              : `-${context.startLaskentaParams.valinnanvaiheNumber ?? 0}`;
            const key = `laskenta-completed-for-${context.startLaskentaParams.hakukohde.oid}${keyPartValinnanvaihe}`;
            const message = wholeHakukohde
              ? 'valinnanhallinta.valmis'
              : 'valinnanhallinta.valmisvalinnanvaihe';
            const messageParams = wholeHakukohde
              ? undefined
              : { nimi: context.startLaskentaParams.valinnanvaiheNimi ?? '' };
            addToast({ key, message, type: 'success', messageParams });
          },
        ],
      },
    },
  });
};
