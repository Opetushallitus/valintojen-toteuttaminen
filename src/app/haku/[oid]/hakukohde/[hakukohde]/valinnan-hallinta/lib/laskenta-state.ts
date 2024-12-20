'use client';

import { assign, fromPromise, setup } from 'xstate';
import { Laskenta, laskentaReducer } from './valinnan-hallinta-types';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import {
  getLaskennanSeurantaTiedot,
  getLaskennanTilaHakukohteelle,
  kaynnistaLaskenta,
} from '@/app/lib/valintalaskenta-service';
import { FetchError } from '@/app/lib/common';
import useToaster, { Toast } from '@/app/hooks/useToaster';
import {
  LaskentaErrorSummary,
  LaskentaStart,
  SeurantaTiedot,
} from '@/app/lib/types/laskenta-types';
import { prop } from 'remeda';
import { useMemo } from 'react';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { useMachine } from '@xstate/react';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';

const POLLING_INTERVAL = 5000;

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
      const message = e.message;
      throw message;
    }
    throw e;
  }
};

export const createLaskentaMachine = (
  params: StartLaskentaParams,
  addToast: (toast: Toast) => void,
) => {
  const valinnanvaiheSelected: boolean = Boolean(params.valinnanvaiheNimi);
  const keyPartValinnanvaihe = valinnanvaiheSelected
    ? `-valinnanvaihe_${params.valinnanvaiheNumber ?? 0}`
    : '';

  const machineKey = `haku_${params.haku.oid}-hakukohteet_${params.hakukohteet.map(prop('oid')).join('_')}${keyPartValinnanvaihe}`;
  return setup({
    types: {
      context: {} as LaskentaContext,
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
    id: `LaskentaMachine-${machineKey}`,
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
            const key = `laskenta-completed-for-${machineKey}`;
            const message = valinnanvaiheSelected
              ? 'valinnanhallinta.valmisvalinnanvaihe'
              : 'valinnanhallinta.valmis';
            const messageParams = valinnanvaiheSelected
              ? { nimi: context.startLaskentaParams.valinnanvaiheNimi ?? '' }
              : undefined;
            addToast({ key, message, type: 'success', messageParams });
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
