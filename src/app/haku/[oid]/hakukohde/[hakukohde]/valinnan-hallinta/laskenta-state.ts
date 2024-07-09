import { assign, createActor, createMachine, fromPromise, setup } from 'xstate';
import { Calculation, calculationReducer } from './valinnan-hallinta-types';
import { ValinnanvaiheTyyppi } from '@/app/lib/valintaperusteet';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import {
  CalculationErrorSummary,
  CalculationStart,
  getLaskennanTilaHakukohteelle,
  kaynnistaLaskenta,
  kaynnistaLaskentaHakukohteenValinnanvaiheille,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { TranslatedName } from '@/app/lib/localization/localization-types';
import {
  SeurantaTiedot,
  getLaskennanSeurantaTiedot,
} from '@/app/lib/valintalaskenta-service';
import { FetchError } from '@/app/lib/common';

type StartCalculationParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaanko: boolean;
  valinnanvaiheNumber?: number;
  translateEntity: (translateable: TranslatedName) => string;
};

export const createLaskentaMachine = (params: StartCalculationParams) => {
  return setup({
    types: {
      context: {} as {
        calculation: Calculation;
        startCalculationParams: StartCalculationParams;
        seurantaTiedot: SeurantaTiedot | null;
        errorSummary: CalculationErrorSummary | null;
      },
    },
    actors: {
      startCalculation: fromPromise(
        ({ input }: { input: StartCalculationParams }) => {
          console.log('HÄR');
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
      pollCalculation: fromPromise(({ input }: { input: CalculationStart }) => {
        console.log('POLLING');
        return getLaskennanSeurantaTiedot(input.loadingUrl);
      }),
      fetchSummary: fromPromise(({ input }: { input: CalculationStart }) => {
        console.log('FETCHING_SUMMARY');
        return getLaskennanTilaHakukohteelle(input.loadingUrl);
      }),
    },
  }).createMachine({
    id: `${params.hakukohde.oid}-${params.valinnanvaiheNumber ?? ''}`,
    initial: 'IDLE',
    context: {
      calculation: {},
      startCalculationParams: params,
      seurantaTiedot: null,
      errorSummary: null,
    },
    states: {
      IDLE: {
        on: {
          START_CALCULATION: {
            target: 'WAITING_CONFIRMATION',
          },
        },
      },
      WAITING_CONFIRMATION: {
        on: {
          CONFIRM: {
            target: 'STARTING',
          },
          CANCEL: {
            target: 'IDLE',
          },
        },
      },
      STARTING: {
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
            target: 'ERROR_CALCULATION',
            actions: assign({
              calculation: ({ event, context }) => {
                const errorMessage = '' + event.error;
                if (event.error instanceof FetchError) {
                  Promise.resolve(event.error.response.text()).then(
                    console.error,
                  );
                }
                return calculationReducer(context.calculation, {
                  errorMessage,
                });
              },
            }),
          },
        },
      },
      PROCESSING: {
        initial: 'FETCHING',
        states: {
          FETCHING: {
            invoke: {
              src: 'pollCalculation',
              input: ({ context }) => context.calculation.runningCalculation,
              onDone: {
                target: 'DETERMINE_POLL_COMPLETION',
                actions: assign({
                  seurantaTiedot: ({ event }) => event.output,
                }),
              },
            },
          },
          WAITING: {
            after: {
              5000: 'FETCHING',
            },
          },
          DETERMINE_POLL_COMPLETION: {
            always: [
              {
                guard: ({ context }) =>
                  context.seurantaTiedot.tila === 'VALMIS',
                target: '#FETCHING_SUMMARY',
              },
              {
                target: 'WAITING',
              },
            ],
          },
        },
      },
      FETCHING_SUMMARY: {
        id: 'FETCHING_SUMMARY',
        invoke: {
          src: 'fetchSummary',
          input: ({ context }) => context.calculation.runningCalculation,
          onDone: {
            target: 'DETERMINE_SUMMARY',
            actions: assign({
              errorSummary: ({ event }) => event.output,
            }),
          },
        },
      },
      DETERMINE_SUMMARY: {
        always: [
          {
            guard: ({ context }) =>
              context.seurantaTiedot != null &&
              context.seurantaTiedot.hakukohteitaKeskeytetty > 0,
            target: 'ERROR_CALCULATION',
            actions: assign({
              calculation: ({ context }) =>
                calculationReducer(context.calculation, {
                  errorMessage: context.errorSummary?.notifications,
                }),
            }),
          },
          {
            target: 'COMPLETED',
          },
        ],
      },
      ERROR_CALCULATION: {
        always: [{ target: 'IDLE' }],
      },
      COMPLETED: {
        always: [{ target: 'IDLE' }],
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

export const laskentaManagerActor = createActor(
  createMachine({
    id: 'laskentaManagerActor',
    context: {
      actors: [],
    },
    on: {
      ADD_CALCULATION: {
        actions: assign({
          actors: ({ context, event }) => {
            return [...context.actors, event.actor];
          },
        }),
      },
      FETCH_CALCULATION: {
        actions: ({ context, event }) => {
          const values = event.value;
          const machineId = values.hakukohde.oid;
          return context.actors.find((actor) => actor.id === machineId);
        },
      },
    },
  }),
);
