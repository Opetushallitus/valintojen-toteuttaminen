import { Toast } from '@/hooks/useToaster';
import { ActorRefFrom, assign, createMachine, PromiseActorLogic } from 'xstate';
import { clone } from 'remeda';
import {
  hasChangedHakemukset,
  applyMassHakemusChanges,
  applySingleHakemusChange,
  ValinnanTulosEditableFields,
} from './valinnan-tulos-machine-utils';
import { ValinnanTulosFields } from '../valinta-tulos-service/valinta-tulos-types';
import { Hakemus } from '../ataru/ataru-types';

export type MinimalHakemusInfo = Pick<
  Hakemus,
  'hakijaOid' | 'hakemusOid' | 'hakijanNimi'
>;

export type ValinnanTulosContext<T extends ValinnanTulosFields> = {
  addToast?: (toast: Toast) => void;
  onUpdated?: () => void;
  hakukohdeOid?: string;
  valintatapajonoOid?: string;
  lastModified?: string;
  hakemukset: Array<MinimalHakemusInfo>;
  tulokset: Array<T>;
  changedTulokset: Array<T>;
  tuloksetForMassUpdate?: Array<T>;
  massChangeAmount?: number;
  publishAfterUpdate?: boolean;
};

export enum ValinnanTulosState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  PUBLISHING = 'PUBLISHING',
}

export enum ValinnanTulosEventType {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  MASS_CHANGE = 'MASS_CHANGE',
  CHANGE = 'CHANGE',
  PUBLISH = 'PUBLISH',
  RESET = 'RESET',
}

export type ValinnanTulosUpdateEvent = {
  type: ValinnanTulosEventType.UPDATE;
};

export type ValinnanTulosMachineParams<T extends ValinnanTulosFields> = {
  hakukohdeOid: string;
  valintatapajonoOid?: string;
  hakemukset: Array<MinimalHakemusInfo>;
  tulokset: Array<T>;
  lastModified: string;
  addToast: (toast: Toast) => void;
  /**
   * Kutsutaan, jos ainakin osa hakemuksista saatiin päivitettyä onnistuneesti.
   */
  onUpdated?: () => void;
};

export type ValinnanTulosResetEvent<T extends ValinnanTulosFields> = {
  type: ValinnanTulosEventType.RESET;
  params: ValinnanTulosMachineParams<T>;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type ValinnanTulosMassUpdateEvent = {
  type: ValinnanTulosEventType.MASS_UPDATE;
} & ValinnanTulosMassChangeParams;

/**
 * Massamuutos parametrina annetuilla tiedoilla. Ei tallenna tietoja, vaan muuttaa context.changedHakemukset-arvoja.
 */
export type ValinnanTulosMassChangeEvent = {
  type: ValinnanTulosEventType.MASS_CHANGE;
} & ValinnanTulosMassChangeParams;

export type ValinnanTulosMassChangeParams = Pick<
  ValinnanTulosEditableFields,
  'valinnanTila' | 'vastaanottoTila' | 'ilmoittautumisTila'
> & {
  hakemusOids: Set<string>;
};

export type ValinnanTulosChangeParams = ValinnanTulosEditableFields & {
  hakemusOid: string;
};

export type ValinnanTulosChangeEvent = {
  type: ValinnanTulosEventType.CHANGE;
} & ValinnanTulosChangeParams;

export type ValinnanTulosPublishEvent = {
  type: ValinnanTulosEventType.PUBLISH;
};

export type ValinnanTuloksetEvents<T extends ValinnanTulosFields> =
  | ValinnanTulosUpdateEvent
  | ValinnanTulosChangeEvent
  | ValinnanTulosMassChangeEvent
  | ValinnanTulosPublishEvent
  | ValinnanTulosMassUpdateEvent
  | ValinnanTulosResetEvent<T>;

export type ValinnanTulosActorRef<
  T extends ValinnanTulosFields = ValinnanTulosFields,
> = ActorRefFrom<ReturnType<typeof createValinnanTulosMachine<T>>>;

export function createValinnanTulosMachine<T extends ValinnanTulosFields>() {
  return createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAYQAkBBAOQHEaBtABgF1EoAA4B7WLgAuuUfiEgAHogC0Adl4BGEgE4ArNo0A2XgCZeq7doAsugDQgAnoiO6SADitWTut712GAZg0TAICAXzD7NCw8QlJKWjoAWRYAZVSAfWZ2Lj5BJBAxCWlZeSUEZQ0AtxJeDytDVSrVVWrW+ycEEw0ai15DQw0rdTc3DTqIqIwcAmJyanoU9IyAVQAFChYAFR4BeSKpGTkC8qNtEkM3XRMvK21TLyMOxEaTEgCrDW1RkNUTQ2skxA0RmcXmiXWmx2eX24kOpROiGsJF0pgMTS8jUuVmeFSCJH+vG0FhMJlGbgGqkMQJBsTmCXokO2PA0+REcJKx1A5WUhlcek8ug+AR8gV0OMcLxqdWuhisAQMqNUNOmdPiCzoaxWACEqGRUkwYQUDpyyioAqSLgE6sETOp9A1ccMtHcbBbzN0yQMVTFZurElrdfrDazYcUjmaKq1DATLoYydpvGN47jGrwLmSrrohY0PlYfaC5kytmROHQILIwCQCAA3UQAayrtL9JGLpY4CFrokw6E5eSN7PDCO5iG8qhIQ10GhaRn6-w0uLGVhIVk0dSuql0TW9kWBqpbbbLYAATsfRMeSMIADa9gBm59QJGbYMPHa7Pb7AgHhQ5EcRCE8GoAjlf55Q8PRVFxAwtF8NxgJuUkxk3As1VbDZmSyAB5JI1loHYKDob8TT-Ec8RITdrg8K5BkaXxhlxcYvgJEUbX0bQ+T+FCD3QnYsJwvCaAI7hQ2NX9h0URBswJBp7lXEJ4LtQwGKGcdQgaYJPh6fwNC4sFAz1A123LStq3wOtGyffc9J1AymHbTszO7Xsjn7PZRKHLkJKjExzj+FS3Gsa0hgYolzkeDFeGtJVlV3Z85n04MjJPM8L2vO8H0s31rKDQzOAcusPxcr83MHeFPJ5bN0x89iLQVKk5UgyUEA0L4Y1Ce4rm0UIWlUfMgXwUQIDgeQ4qIMMysjNQPFjCkEyTIwTFxSoehXRTAjJHpgOA3T6QWcbTX-ZRPHOIk-D8K43BaS47Cano3hsAw+XGfwPhiqYsqLHj232kivJ6ZdBTqSxLoC7xcUolc5UCOpIoTXQdtIYsaD43CaHwn7xJ5HzXDlW1TFaRibs6CxxzcMlKLJyKPmpWKrPimzEs4DHypUS4Tu6Kwya8S6Pm0RdvhXOpesugYtztCIIiAA */
    id: 'ValinnanTuloksetMachine',
    initial: ValinnanTulosState.IDLE,
    types: {} as {
      context: ValinnanTulosContext<T>;
      events: ValinnanTuloksetEvents<T>;
      actions:
        | { type: 'alert'; params: { message: string } }
        | { type: 'successNotify'; params: { message: string } }
        | { type: 'errorModal'; params: { error: Error } }
        | { type: 'notifyMassStatusChange' }
        | { type: 'updated'; params?: { error?: Error } };
      actors:
        | {
            src: 'updateHakemukset';
            logic: PromiseActorLogic<
              void,
              {
                hakukohdeOid?: string;
                valintatapajonoOid?: string;
                lastModified?: string;
                changed: Array<T>;
                original: Array<T>;
              }
            >;
          }
        | {
            src: 'publish';
            logic: PromiseActorLogic<void, { valintatapajonoOid?: string }>;
          };
    },
    context: {
      hakemukset: [],
      tulokset: [],
      changedTulokset: [],
    },
    on: {
      [ValinnanTulosEventType.RESET]: {
        actions: assign(({ event }) => {
          return {
            valintatapajonoOid: event.params.valintatapajonoOid,
            hakukohdeOid: event.params.hakukohdeOid,
            lastModified: event.params.lastModified,
            hakemukset: clone(event.params.hakemukset),
            tulokset: clone(event.params.tulokset),
            changedTulokset: [],
            tuloksetForMassUpdate: undefined,
            addToast: event.params.addToast,
            onUpdated: event.params.onUpdated,
          };
        }),
      },
    },
    states: {
      [ValinnanTulosState.IDLE]: {
        on: {
          [ValinnanTulosEventType.CHANGE]: {
            actions: assign({
              changedTulokset: ({ context, event }) => {
                return applySingleHakemusChange(context, event);
              },
            }),
          },
          [ValinnanTulosEventType.MASS_CHANGE]: {
            actions: [
              assign(({ context, event }) => {
                return applyMassHakemusChanges(context, event);
              }),
              'notifyMassStatusChange',
            ],
          },
          [ValinnanTulosEventType.MASS_UPDATE]: {
            target: ValinnanTulosState.UPDATING,
            actions: assign({
              tuloksetForMassUpdate: ({ context, event }) => {
                return context.tulokset.reduce((result, tulos) => {
                  return event.hakemusOids.has(tulos.hakemusOid)
                    ? [
                        ...result,
                        {
                          ...tulos,
                          ilmoittautumisTila:
                            event.ilmoittautumisTila ??
                            tulos.ilmoittautumisTila,
                          vastaanottotila:
                            event.vastaanottoTila ?? tulos.vastaanottoTila,
                        },
                      ]
                    : result;
                }, [] as Array<T>);
              },
            }),
          },
          [ValinnanTulosEventType.UPDATE]: [
            {
              guard: 'hasChangedHakemukset',
              target: ValinnanTulosState.UPDATING,
            },
            {
              actions: {
                type: 'alert',
                params: { message: 'virhe.eimuutoksia' },
              },
            },
          ],
          [ValinnanTulosEventType.PUBLISH]: [
            {
              guard: 'hasChangedHakemukset',
              actions: assign({ publishAfterUpdate: true }),
              target: ValinnanTulosState.UPDATING,
            },
            {
              target: ValinnanTulosState.PUBLISHING,
            },
          ],
        },
      },
      [ValinnanTulosState.UPDATING]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => ({
            changed: context.tuloksetForMassUpdate ?? context.changedTulokset,
            original: context.tulokset,
            hakukohdeOid: context.hakukohdeOid,
            valintatapajonoOid: context.valintatapajonoOid,
            lastModified: context.lastModified,
          }),
          onDone: {
            target: ValinnanTulosState.UPDATE_COMPLETED,
          },
          onError: {
            target: ValinnanTulosState.IDLE,
            actions: [
              {
                type: 'errorModal',
                params: ({ event }) => ({
                  error: event.error as Error,
                }),
              },
              {
                type: 'updated',
                params: ({ event }) => ({
                  error: event.error as Error,
                }),
              },
              assign({
                tuloksetForMassUpdate: undefined,
              }),
            ],
          },
        },
      },
      [ValinnanTulosState.UPDATE_COMPLETED]: {
        entry: [
          assign({
            tuloksetForMassUpdate: undefined,
          }),
        ],
        always: [
          {
            guard: 'shouldPublishAfterUpdate',
            target: ValinnanTulosState.PUBLISHING,
            actions: assign({ publishAfterUpdate: false }),
          },
          {
            target: ValinnanTulosState.IDLE,
            actions: [
              'updated',
              {
                type: 'successNotify',
                params: { message: 'sijoittelun-tulokset.valmis' },
              },
            ],
          },
        ],
      },
      [ValinnanTulosState.PUBLISHING]: {
        invoke: {
          src: 'publish',
          input: ({ context }) => ({
            valintatapajonoOid: context.valintatapajonoOid,
          }),
          onDone: {
            target: ValinnanTulosState.IDLE,
            actions: {
              type: 'successNotify',
              params: { message: 'sijoittelun-tulokset.hyvaksytty' },
            },
          },
          onError: {
            target: ValinnanTulosState.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => ({ error: event.error as Error }),
            },
          },
        },
      },
    },
  }).provide({
    guards: {
      hasChangedHakemukset,
      shouldPublishAfterUpdate: ({ context }) =>
        Boolean(context.publishAfterUpdate),
    },
  });
}
