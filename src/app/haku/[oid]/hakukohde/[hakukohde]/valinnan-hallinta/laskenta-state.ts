import { assign, fromPromise, setup } from 'xstate';
import { Calculation, calculationReducer } from './valinnan-hallinta-types';
import { ValinnanvaiheTyyppi } from '@/app/lib/valintaperusteet';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import {
  CalculationErrorSummary,
  getLaskennanTilaHakukohteelle,
  kaynnistaLaskenta,
  kaynnistaLaskentaHakukohteenValinnanvaiheille,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { TranslatedName } from '@/app/lib/localization/localization-types';
import {
  SeurantaTiedot,
  getLaskennanSeurantaTiedot,
} from '@/app/lib/valintalaskenta-service';

type StartCalculationParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaanko: boolean;
  valinnanvaiheNumber?: number;
  translateEntity: (translateable: TranslatedName) => string;
};

export type LaskentaContext = {
  calculation: Calculation;
  startCalculationParams: StartCalculationParams;
  seurantaTiedot: SeurantaTiedot | null;
  errorSummary: CalculationErrorSummary | null;
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
  ERROR_CALCULATION = 'ERROR_CALCULATION',
  COMPLETED = 'COMPLETED',
}

export enum LaskentaEvents {
  START_CALCULATION = 'START_CALCULATION',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}

export const createLaskentaMachine = (params: StartCalculationParams) => {
  return setup({
    types: {
      context: {} as LaskentaContext,
    },
    actors: {
      startCalculation: fromPromise(
        ({ input }: { input: StartCalculationParams }) => {
          if (input.valinnanvaiheTyyppi && input.valinnanvaiheNumber) {
            return kaynnistaLaskenta(
              input.haku,
              input.hakukohde,
              input.valinnanvaiheTyyppi,
              input.sijoitellaanko,
              input.valinnanvaiheNumber,
              input.translateEntity,
            );
          } else {
            return kaynnistaLaskentaHakukohteenValinnanvaiheille(
              input.haku,
              input.hakukohde,
              input.sijoitellaanko,
              input.translateEntity,
            );
          }
        },
      ),
      pollCalculation: fromPromise(({ input }: { input: Calculation }) => {
        if (input.runningCalculation) {
          return getLaskennanSeurantaTiedot(
            input.runningCalculation.loadingUrl,
          );
        }
        throw 'Tried to fetch seurantatiedot without having access to running laskenta';
      }),
      fetchSummary: fromPromise(({ input }: { input: Calculation }) => {
        if (input.runningCalculation) {
          return getLaskennanTilaHakukohteelle(
            input.runningCalculation.loadingUrl,
          );
        }
        throw 'Tried to fetch summary without having access to laskenta';
      }),
    },
  }).createMachine({
    id: `LaskentaMachine-${params.hakukohde.oid}-${params.valinnanvaiheNumber ?? ''}`,
    initial: LaskentaStates.IDLE,
    context: {
      calculation: {},
      startCalculationParams: params,
      seurantaTiedot: null,
      errorSummary: null,
    },
    states: {
      [LaskentaStates.IDLE]: {
        on: {
          [LaskentaEvents.START_CALCULATION]: {
            target: LaskentaStates.WAITING_CONFIRMATION,
          },
        },
      },
      [LaskentaStates.WAITING_CONFIRMATION]: {
        on: {
          [LaskentaEvents.CONFIRM]: {
            target: LaskentaStates.STARTING,
            actions: assign({
              calculation: {},
            }),
          },
          [LaskentaEvents.CANCEL]: {
            target: LaskentaStates.IDLE,
          },
        },
      },
      [LaskentaStates.STARTING]: {
        invoke: {
          src: 'startCalculation',
          input: ({ context }) => context.startCalculationParams,
          onDone: {
            target: 'PROCESSING.FETCHING',
            actions: assign({
              calculation: ({ event, context }) =>
                calculationReducer(context.calculation, {
                  runningCalculation: event.output,
                }),
            }),
          },
          onError: {
            target: LaskentaStates.ERROR_CALCULATION,
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
              src: 'pollCalculation',
              input: ({ context }) => context.calculation,
              onDone: {
                target: LaskentaStates.PROCESSING_DETERMINE_POLL_COMPLETION,
                actions: assign({
                  seurantaTiedot: ({ event }) => event.output,
                }),
              },
              onError: {
                target: '#ERROR_CALCULATION',
                actions: assign({
                  error: ({ event }) => event.error as Error,
                }),
              },
            },
          },
          [LaskentaStates.PROCESSING_WAITING]: {
            after: {
              5000: LaskentaStates.PROCESSING_FETCHING,
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
          input: ({ context }) => context.calculation,
          onDone: {
            target: LaskentaStates.DETERMINE_SUMMARY,
            actions: assign({
              errorSummary: ({ event }) => event.output,
            }),
          },
          onError: {
            target: LaskentaStates.ERROR_CALCULATION,
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
              context.seurantaTiedot != null &&
              context.seurantaTiedot.hakukohteitaKeskeytetty > 0,
            target: LaskentaStates.ERROR_CALCULATION,
            actions: assign({
              calculation: ({ context }) =>
                calculationReducer(context.calculation, {
                  errorMessage: context.errorSummary?.notifications,
                }),
            }),
          },
          {
            target: LaskentaStates.COMPLETED,
          },
        ],
      },
      [LaskentaStates.ERROR_CALCULATION]: {
        id: 'ERROR_CALCULATION',
        always: [{ target: LaskentaStates.IDLE }],
      },
      [LaskentaStates.COMPLETED]: {
        always: [{ target: LaskentaStates.IDLE }],
        entry: [
          assign({
            calculation: ({ context }) =>
              calculationReducer(context.calculation, {
                calculatedTime: new Date(),
              }),
          }),
        ],
      },
    },
  });
};
