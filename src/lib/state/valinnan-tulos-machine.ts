import { Toast } from '@/hooks/useToaster';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { ActorRefFrom, assign, createMachine } from 'xstate';
import { clone } from 'remeda';
import {
  hasChangedHakemukset,
  applyMassHakemusChanges,
  applySingleHakemusChange,
} from './valinnan-tulos-machine-utils';

export type ValinnanTulosContext = {
  addToast?: (toast: Toast) => void;
  onUpdated?: () => void;
  hakukohdeOid?: string;
  valintatapajonoOid?: string;
  lastModified?: string;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  changedHakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  hakemuksetForMassUpdate?: Array<SijoittelunHakemusValintatiedoilla>;
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

export type ValinnanTulosMachineParams = {
  hakukohdeOid: string;
  valintatapajonoOid: string;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  lastModified: string;
  addToast: (toast: Toast) => void;
  /**
   * Kutsutaan, jos ainakin osa hakemuksista saatiin päivitettyä onnistuneesti.
   */
  onUpdated?: () => void;
};

export type ValinnanTulosResetEvent = {
  type: ValinnanTulosEventType.RESET;
  params: ValinnanTulosMachineParams;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type ValinnanTulosMassUpdateEvent = {
  type: ValinnanTulosEventType.MASS_UPDATE;
} & MassChangeParams;

/**
 * Massamuutos parametrina annetuilla tiedoilla. Ei tallenna tietoja, vaan muuttaa context.changedHakemukset-arvoja.
 */
export type ValinnanTulosMassChangeEvent = {
  type: ValinnanTulosEventType.MASS_CHANGE;
} & MassChangeParams;

export type ValinnanTulosEditableFields = Partial<
  Pick<
    SijoittelunHakemusValintatiedoilla,
    | 'julkaistavissa'
    | 'ehdollisestiHyvaksyttavissa'
    | 'ehdollisenHyvaksymisenEhtoKoodi'
    | 'ehdollisenHyvaksymisenEhtoFI'
    | 'ehdollisenHyvaksymisenEhtoSV'
    | 'ehdollisenHyvaksymisenEhtoEN'
    | 'hyvaksyttyVarasijalta'
    | 'vastaanottotila'
    | 'ilmoittautumisTila'
    | 'maksunTila'
    | 'tila' // valinnan/sijoittelun tila
  >
>;

export type MassChangeParams = Pick<
  ValinnanTulosEditableFields,
  'tila' | 'vastaanottotila' | 'ilmoittautumisTila'
> & {
  hakemusOids: Set<string>;
};

export type ValinnanTulosChangeParams = ValinnanTulosEditableFields & {
  hakemusOid: string;
};

export type SijoittelunTulosChangeEvent = {
  type: ValinnanTulosEventType.CHANGE;
} & ValinnanTulosChangeParams;

export type ValinnanTulosPublishEvent = {
  type: ValinnanTulosEventType.PUBLISH;
};

export type SijoittelunTuloksetEvents =
  | ValinnanTulosUpdateEvent
  | SijoittelunTulosChangeEvent
  | ValinnanTulosMassChangeEvent
  | ValinnanTulosPublishEvent
  | ValinnanTulosMassUpdateEvent
  | ValinnanTulosResetEvent;

export type ValinnanTulosActorRef = ActorRefFrom<
  typeof valinnanTulosMachineBase
>;

export const valinnanTulosMachineBase = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAYQAkBBAOQHEaBtABgF1EoAA4B7WLgAuuUfiEgAHogC0Adl4BGEgE4ArNo0A2XgCZeq7doAsugDQgAnoiO6SADitWTut712GAZg0TAICAXzD7NCw8QlJKWjoAWRYAZVSAfWZ2Lj5BJBAxCWlZeSUEZQ0AtxJeDytDVSrVVWrW+ycEEw0ai15DQw0rdTc3DTqIqIwcAmJyanoU9IyAVQAFChYAFR4BeSKpGTkC8qNtEkM3XRMvK21TLyMOxEaTEgCrDW1RkNUTQ2skxA0RmcXmiXWmx2eX24kOpROiGsJF0pgMTS8jUuVmeFSCJH+vG0FhMJlGbgGqkMQJBsTmCXokO2PA0+REcJKx1A5WUhlcek8ug+AR8gV0OMcLxqdWuhisAQMqNUNOmdPiCzoaxWACEqGRUkwYQUDpyyioAqSLgE6sETOp9A1ccMtHcbBbzN0yQMVTFZurElrdfrDazYcUjmaKq1DATLoYydpvGN47jGrwLmSrrohY0PlYfaC5kytmROHQILIwCQCAA3UQAayrtL9JGLpY4CFrokw6E5eSN7PDCO5iG8qhIQ10GhaRn6-w0uLGVhIVk0dSuql0TW9kWBqpbbbLYAATsfRMeSMIADa9gBm59QJGbYMPHa7Pb7AgHhQ5EcRCE8GoAjlf55Q8PRVFxAwtF8NxgJuUkxk3As1VbDZmSyAB5JI1loHYKDob8TT-Ec8RITdrg8K5BkaXxhlxcYvgJEUbX0bQ+T+FCD3QnYsJwvCaAI7hQ2NX9h0URBswJBp7lXEJ4LtQwGKGcdQgaYJPh6fwNC4sFAz1A123LStq3wOtGyffc9J1AymHbTszO7Xsjn7PZRKHLkJKjExzj+FS3Gsa0hgYolzkeDFeGtJVlV3Z85n04MjJPM8L2vO8H0s31rKDQzOAcusPxcr83MHeFPJ5bN0x89iLQVKk5UgyUEA0L4Y1Ce4rm0UIWlUfMgXwUQIDgeQ4qIMMysjNQPFjCkEyTIwTFxSoehXRTAjJHpgOA3T6QWcbTX-ZRPHOIk-D8K43BaS47Cano3hsAw+XGfwPhiqYsqLHj232kivJ6ZdBTqSxLoC7xcUolc5UCOpIoTXQdtIYsaD43CaHwn7xJ5HzXDlW1TFaRibs6CxxzcMlKLJyKPmpWKrPimzEs4DHypUS4Tu6Kwya8S6Pm0RdvhXOpesugYtztCIIiAA */
  id: 'ValinnanTuloksetMachine',
  initial: ValinnanTulosState.IDLE,
  types: {} as {
    context: ValinnanTulosContext;
    events: SijoittelunTuloksetEvents;
    actions:
      | { type: 'alert'; params: { message: string } }
      | { type: 'successNotify'; params: { message: string } }
      | { type: 'errorModal'; params: { error: Error } }
      | { type: 'notifyMassStatusChange' }
      | { type: 'updated'; params?: { error?: Error } };
  },
  context: {
    hakemukset: [],
    changedHakemukset: [],
  },
  on: {
    [ValinnanTulosEventType.RESET]: {
      actions: assign(({ event }) => {
        return {
          valintatapajonoOid: event.params.valintatapajonoOid,
          hakukohdeOid: event.params.hakukohdeOid,
          lastModified: event.params.lastModified,
          hakemukset: clone(event.params.hakemukset),
          changedHakemukset: [],
          hakemuksetForMassUpdate: undefined,
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
            changedHakemukset: ({ context, event }) => {
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
            hakemuksetForMassUpdate: ({ context, event }) => {
              return context.hakemukset.reduce((result, hakemus) => {
                return event.hakemusOids.has(hakemus.hakemusOid)
                  ? [
                      ...result,
                      {
                        ...hakemus,
                        ilmoittautumisTila:
                          event.ilmoittautumisTila ??
                          hakemus.ilmoittautumisTila,
                        vastaanottotila:
                          event.vastaanottotila ?? hakemus.vastaanottotila,
                      },
                    ]
                  : result;
              }, [] as Array<SijoittelunHakemusValintatiedoilla>);
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
          changed: context.hakemuksetForMassUpdate ?? context.changedHakemukset,
          original: context.hakemukset,
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
              hakemuksetForMassUpdate: undefined,
            }),
          ],
        },
      },
    },
    [ValinnanTulosState.UPDATE_COMPLETED]: {
      entry: [
        assign({
          hakemuksetForMassUpdate: undefined,
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

export const valinnanTulosMachine = valinnanTulosMachineBase.provide({});
