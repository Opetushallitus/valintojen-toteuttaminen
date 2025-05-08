import { Toast } from '@/hooks/useToaster';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { clone, isNullish } from 'remeda';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/components/modals/global-modal';
import { OphApiError } from '@/lib/common';
import {
  hasChangedHakemukset,
  applyMassHakemusChanges,
  applySingleHakemusChange,
} from './sijoittelun-tulokset-state-utils';
import { useEffect } from 'react';
import { useActorRef } from '@xstate/react';

export type SijoittelunTuloksetContext = {
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

export enum SijoittelunTuloksetState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  PUBLISHING = 'PUBLISHING',
}

export enum SijoittelunTuloksetEventType {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  MASS_CHANGE = 'MASS_CHANGE',
  CHANGE = 'CHANGE',
  PUBLISH = 'PUBLISH',
  RESET = 'RESET',
}

export type SijoittelunTulosUpdateEvent = {
  type: SijoittelunTuloksetEventType.UPDATE;
};

type SijoitteluntuloksetMachineParams = {
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

export type SijoittelunTulosResetEvent = {
  type: SijoittelunTuloksetEventType.RESET;
  params: SijoitteluntuloksetMachineParams;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type SijoittelunTulosMassUpdateEvent = {
  type: SijoittelunTuloksetEventType.MASS_UPDATE;
} & MassChangeParams;

/**
 * Massamuutos parametrina annetuilla tiedoilla. Ei tallenna tietoja, vaan muuttaa context.changedHakemukset-arvoja.
 */
export type SijoittelunTulosMassChangeEvent = {
  type: SijoittelunTuloksetEventType.MASS_CHANGE;
} & MassChangeParams;

export type SijoittelunTulosEditableFields = Partial<
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
  >
>;

export type MassChangeParams = Pick<
  SijoittelunTulosEditableFields,
  'vastaanottotila' | 'ilmoittautumisTila'
> & {
  hakemusOids: Set<string>;
};

export type SijoittelunTulosChangeParams = SijoittelunTulosEditableFields & {
  hakemusOid: string;
};

export type SijoittelunTulosChangeEvent = {
  type: SijoittelunTuloksetEventType.CHANGE;
} & SijoittelunTulosChangeParams;

export type SijoittelunTulosPublishEvent = {
  type: SijoittelunTuloksetEventType.PUBLISH;
};

export type SijoittelunTuloksetEvents =
  | SijoittelunTulosUpdateEvent
  | SijoittelunTulosChangeEvent
  | SijoittelunTulosMassChangeEvent
  | SijoittelunTulosPublishEvent
  | SijoittelunTulosMassUpdateEvent
  | SijoittelunTulosResetEvent;

export type SijoittelunTulosActorRef = ActorRefFrom<
  typeof sijoittelunTuloksetMachine
>;

export const sijoittelunTuloksetMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAYQAkBBAOQHEaBtABgF1EoAA4B7WLgAuuUfiEgAHogC0Adl4BGEgE4ArNo0A2XgCZeq7doAsugDQgAnoiO6SADitWTut712GAZg0TAICAXzD7NCw8QlJKWjoAWRYAZVSAfWZ2Lj5BJBAxCWlZeSUEZQ0AtxJeDytDVSrVVWrW+ycEEw0ai15DQw0rdTc3DTqIqIwcAmJyanoU9IyAVQAFChYAFR4BeSKpGTkC8qNtEkM3XRMvK21TLyMOxEaTEgCrDW1RkNUTQ2skxA0RmcXmiXWmx2eX24kOpROiGsJF0pgMTS8jUuVmeFSCJH+vG0FhMJlGbgGqkMQJBsTmCXokO2PA0+REcJKx1A5WUhlcek8ug+AR8gV0OMcLxqdWuhisAQMqNUNOmdPiCzoaxWACEqGRUkwYQUDpyyioAqSLgE6sETOp9A1ccMtHcbBbzN0yQMVTFZurElrdfrDazYcUjmaKq1DATLoYydpvGN47jGrwLmSrrohY0PlYfaC5kytmROHQILIwCQCAA3UQAayrtL9JGLpY4CFrokw6E5eSN7PDCO5iG8qhIQ10GhaRn6-w0uLGVhIVk0dSuql0TW9kWBqpbbbLYAATsfRMeSMIADa9gBm59QJGbYMPHa7Pb7AgHhQ5EcRCE8GoAjlf55Q8PRVFxAwtF8NxgJuUkxk3As1VbDZmSyAB5JI1loHYKDob8TT-Ec8RITdrg8K5BkaXxhlxcYvgJEUbX0bQ+T+FCD3QnYsJwvCaAI7hQ2NX9h0URBswJBp7lXEJ4LtQwGKGcdQgaYJPh6fwNC4sFAz1A123LStq3wOtGyffc9J1AymHbTszO7Xsjn7PZRKHLkJKjExzj+FS3Gsa0hgYolzkeDFeGtJVlV3Z85n04MjJPM8L2vO8H0s31rKDQzOAcusPxcr83MHeFPJ5bN0x89iLQVKk5UgyUEA0L4Y1Ce4rm0UIWlUfMgXwUQIDgeQ4qIMMysjNQPFjCkEyTIwTFxSoehXRTAjJHpgOA3T6QWcbTX-ZRPHOIk-D8K43BaS47Cano3hsAw+XGfwPhiqYsqLHj232kivJ6ZdBTqSxLoC7xcUolc5UCOpIoTXQdtIYsaD43CaHwn7xJ5HzXDlW1TFaRibs6CxxzcMlKLJyKPmpWKrPimzEs4DHypUS4Tu6Kwya8S6Pm0RdvhXOpesugYtztCIIiAA */
  id: 'SijoittelunTuloksetMachine',
  initial: SijoittelunTuloksetState.IDLE,
  types: {} as {
    context: SijoittelunTuloksetContext;
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
    [SijoittelunTuloksetEventType.RESET]: {
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
    [SijoittelunTuloksetState.IDLE]: {
      on: {
        [SijoittelunTuloksetEventType.CHANGE]: {
          actions: assign({
            changedHakemukset: ({ context, event }) => {
              return applySingleHakemusChange(context, event);
            },
          }),
        },
        [SijoittelunTuloksetEventType.MASS_CHANGE]: {
          actions: [
            assign(({ context, event }) => {
              return applyMassHakemusChanges(context, event);
            }),
            'notifyMassStatusChange',
          ],
        },
        [SijoittelunTuloksetEventType.MASS_UPDATE]: {
          target: SijoittelunTuloksetState.UPDATING,
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
        [SijoittelunTuloksetEventType.UPDATE]: [
          {
            guard: 'hasChangedHakemukset',
            target: SijoittelunTuloksetState.UPDATING,
          },
          {
            actions: {
              type: 'alert',
              params: { message: 'virhe.eimuutoksia' },
            },
          },
        ],
        [SijoittelunTuloksetEventType.PUBLISH]: [
          {
            guard: 'hasChangedHakemukset',
            actions: assign({ publishAfterUpdate: true }),
            target: SijoittelunTuloksetState.UPDATING,
          },
          {
            target: SijoittelunTuloksetState.PUBLISHING,
          },
        ],
      },
    },
    [SijoittelunTuloksetState.UPDATING]: {
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
          target: SijoittelunTuloksetState.UPDATE_COMPLETED,
        },
        onError: {
          target: SijoittelunTuloksetState.IDLE,
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
    [SijoittelunTuloksetState.UPDATE_COMPLETED]: {
      entry: [
        assign({
          hakemuksetForMassUpdate: undefined,
        }),
      ],
      always: [
        {
          guard: 'shouldPublishAfterUpdate',
          target: SijoittelunTuloksetState.PUBLISHING,
          actions: assign({ publishAfterUpdate: false }),
        },
        {
          target: SijoittelunTuloksetState.IDLE,
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
    [SijoittelunTuloksetState.PUBLISHING]: {
      invoke: {
        src: 'publish',
        input: ({ context }) => ({
          valintatapajonoOid: context.valintatapajonoOid,
        }),
        onDone: {
          target: SijoittelunTuloksetState.IDLE,
          actions: {
            type: 'successNotify',
            params: { message: 'sijoittelun-tulokset.hyvaksytty' },
          },
        },
        onError: {
          target: SijoittelunTuloksetState.IDLE,
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
  actions: {
    alert: ({ context }, params) =>
      context.addToast?.({
        key: `sijoittelun-tulokset-update-failed-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
        message: params.message,
        type: 'error',
      }),

    successNotify: ({ context }, params) => {
      context.onUpdated?.();
      context.addToast?.({
        key: `sijoittelun-tulokset-updated-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
        message: params.message,
        type: 'success',
      });
    },
    notifyMassStatusChange: ({ context }) => {
      context.addToast?.({
        key: `sijoittelun-tulokset-mass-status-change-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
        message: 'sijoittelun-tulokset.mass-status-change-done',
        type: 'success',
        messageParams: { amount: context.massChangeAmount ?? 0 },
      });
    },
    updated: ({ context }, params) => {
      if (isNullish(params?.error)) {
        context.onUpdated?.();
      } else if (
        params.error instanceof OphApiError &&
        Array.isArray(params.error?.response?.data)
      ) {
        const erroredHakemusOids = params.error?.response.data?.map(
          (error) => error.hakemusOid as string,
        );
        const someHakemusUpdated = context.changedHakemukset.some(
          (h) => !erroredHakemusOids.includes(h.hakemusOid),
        );
        if (someHakemusUpdated) {
          context.onUpdated?.();
        }
      }
    },
    errorModal: ({ context }, params) => {
      showModal(SijoittelunTulosErrorModalDialog, {
        error: params.error,
        hakemukset: context.hakemukset,
      });
    },
  },
  actors: {
    updateHakemukset: fromPromise(
      async ({
        input,
      }: {
        input: {
          hakukohdeOid: string;
          valintatapajonoOid: string;
          lastModified: string;
          changed: Array<SijoittelunHakemusValintatiedoilla>;
          original: Array<SijoittelunHakemusValintatiedoilla>;
        };
      }) => {
        await saveMaksunTilanMuutokset(
          input.hakukohdeOid,
          input.changed,
          input.original,
        );
        return saveSijoitteluAjonTulokset(
          input.valintatapajonoOid,
          input.hakukohdeOid,
          input.lastModified,
          input.changed,
        );
      },
    ),
    publish: fromPromise(
      ({ input }: { input: { valintatapajonoOid: string } }) =>
        hyvaksyValintaEsitys(input.valintatapajonoOid),
    ),
  },
});

export const useSijoittelunTulosActorRef = ({
  hakukohdeOid,
  hakemukset,
  valintatapajonoOid,
  lastModified,
  addToast,
  onUpdated,
}: SijoitteluntuloksetMachineParams) => {
  const sijoittelunTuloksetActorRef = useActorRef(sijoittelunTuloksetMachine);

  useEffect(() => {
    sijoittelunTuloksetActorRef.send({
      type: SijoittelunTuloksetEventType.RESET,
      params: {
        hakukohdeOid,
        valintatapajonoOid,
        hakemukset,
        lastModified,
        onUpdated,
        addToast,
      },
    });
  }, [
    sijoittelunTuloksetActorRef,
    hakemukset,
    hakukohdeOid,
    lastModified,
    valintatapajonoOid,
    onUpdated,
    addToast,
  ]);

  return sijoittelunTuloksetActorRef;
};
