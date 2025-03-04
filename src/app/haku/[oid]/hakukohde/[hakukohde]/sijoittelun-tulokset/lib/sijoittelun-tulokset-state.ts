import { Toast } from '@/app/hooks/useToaster';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/app/lib/valinta-tulos-service/valinta-tulos-service';
import { clone } from 'remeda';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/app/components/global-modal';
import { OphApiError } from '@/app/lib/common';
import {
  hasChangedHakemukset,
  applyMassHakemusChanges,
  filterUnchangedFromChangedHakemukset,
  applySingleHakemusChange,
  applyChangesToHakemukset,
} from './sijoittelun-tulokset-state-utils';

export type SijoittelunTuloksetContext = {
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
}

export type SijoittelunTulosUpdateEvent = {
  type: SijoittelunTuloksetEventType.UPDATE;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type SijoittelunTulosMassUpdateEvent = {
  type: SijoittelunTuloksetEventType.MASS_UPDATE;
} & MassChangeParams;

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
  | SijoittelunTulosMassUpdateEvent;

export type SijoittelunTulosActorRef = ActorRefFrom<
  ReturnType<typeof createSijoittelunTuloksetMachine>
>;

export const createSijoittelunTuloksetMachine = (
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>,
  lastModified: string,
  addToast: (toast: Toast) => void,
) => {
  const tuloksetMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAYQAkBBAOQHEaBtABgF1EoAA4B7WLgAuuUfiEgAHogC0Adl4BGEgE4ArNo0A2XgCZeq7doAsugDQgAnoiO6SADitWTut712GAZg0TAICAXzD7NCw8QlJKWjoAWRYAZVSAfWZ2Lj5BJBAxCWlZeSUEZQ0AtxJeDytDVSrVVWrW+ycEEw0ai15DQw0rdTc3DTqIqIwcAmJyanoU9IyAVQAFChYAFR4BeSKpGTkC8qNtEkM3XRMvK21TLyMOxEaTEgCrDW1RkNUTQ2skxA0RmcXmiXWmx2eX24kOpROiGsJF0pgMTS8jUuVmeFSCJH+vG0FhMJlGbgGqkMQJBsTmCXokO2PA0+REcJKx1A5WUhlcek8ug+AR8gV0OMcLxqdWuhisAQMqNUNOmdPiCzoaxWACEqGRUkwYQUDpyyioAqSLgE6sETOp9A1ccMtHcbBbzN0yQMVTFZurElrdfrDazYcUjmaKq1DATLoYydpvGN47jGrwLmSrrohY0PlYfaC5kytmROHQILIwCQCAA3UQAayrtL9JGLpY4CFrokw6E5eSN7PDCO5iG8qhIQ10GhaRn6-w0uLGVhIVk0dSuql0TW9kWBqpbbbLYAATsfRMeSMIADa9gBm59QJGbYMPHa7Pb7AgHhQ5EcRCE8GoAjlf55Q8PRVFxAwtF8NxgJuUkxk3As1VbDZmSyAB5JI1loHYKDob8TT-Ec8RITdrg8K5BkaXxhlxcYvgJEUbX0bQ+T+FCD3QnYsJwvCaAI7hQ2NX9h0URBswJBp7lXEJ4LtQwGKGcdQgaYJPh6fwNC4sFAz1A123LStq3wOtGyffc9J1AymHbTszO7Xsjn7PZRKHLkJKjExzj+FS3Gsa0hgYolzkeDFeGtJVlV3Z85n04MjJPM8L2vO8H0s31rKDQzOAcusPxcr83MHeFPJ5bN0x89iLQVKk5UgyUEA0L4Y1Ce4rm0UIWlUfMgXwUQIDgeQ4qIMMysjNQPFjCkEyTIwTFxSoehXRTAjJHpgOA3T6QWcbTX-ZRPHOIk-D8K43BaS47Cano3hsAw+XGfwPhiqYsqLHj232kivJ6ZdBTqSxLoC7xcUolc5UCOpIoTXQdtIYsaD43CaHwn7xJ5HzXDlW1TFaRibs6CxxzcMlKLJyKPmpWKrPimzEs4DHypUS4Tu6Kwya8S6Pm0RdvhXOpesugYtztCIIiAA */
    id: `SijoittelunTuloksetMachine`,
    initial: SijoittelunTuloksetState.IDLE,
    types: {} as {
      context: SijoittelunTuloksetContext;
      events: SijoittelunTuloksetEvents;
      actions:
        | { type: 'alert'; params: { message: string } }
        | { type: 'successNotify'; params: { message: string } }
        | { type: 'errorModal'; params: { error: Error } }
        | { type: 'notifyMassStatusChange' };
    },
    context: {
      hakemukset: clone(hakemukset),
      hakemuksetForMassUpdate: undefined,
      changedHakemukset: [],
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
            changed:
              context.hakemuksetForMassUpdate ?? context.changedHakemukset,
            original: context.hakemukset,
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
              assign({
                hakemukset: ({ context, event }) => {
                  if (
                    event.error instanceof OphApiError &&
                    Array.isArray(event.error?.response?.data)
                  ) {
                    const erroredHakemusOids = event.error?.response.data?.map(
                      (error) => error.hakemusOid as string,
                    );
                    return applyChangesToHakemukset(
                      context,
                      erroredHakemusOids,
                    );
                  } else {
                    return context.hakemukset;
                  }
                },
              }),
              assign({
                changedHakemukset: ({ context }) =>
                  filterUnchangedFromChangedHakemukset(context),
                hakemuksetForMassUpdate: undefined,
              }),
            ],
          },
        },
      },
      [SijoittelunTuloksetState.UPDATE_COMPLETED]: {
        always: [
          {
            guard: 'shouldPublishAfterUpdate',
            target: SijoittelunTuloksetState.PUBLISHING,
            actions: assign({ publishAfterUpdate: false }),
          },
          {
            target: SijoittelunTuloksetState.IDLE,
            actions: {
              type: 'successNotify',
              params: { message: 'sijoittelun-tulokset.valmis' },
            },
          },
        ],
        entry: [
          assign({
            hakemukset: ({ context }) => applyChangesToHakemukset(context),
          }),
          assign({
            changedHakemukset: ({ context }) =>
              filterUnchangedFromChangedHakemukset(context),
            hakemuksetForMassUpdate: undefined,
          }),
        ],
      },
      [SijoittelunTuloksetState.PUBLISHING]: {
        invoke: {
          src: 'publish',
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
  });

  return tuloksetMachine.provide({
    guards: {
      hasChangedHakemukset,
      shouldPublishAfterUpdate: ({ context }) =>
        Boolean(context.publishAfterUpdate),
    },
    actions: {
      alert: (_, params) =>
        addToast({
          key: `sijoittelun-tulokset-update-failed-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),
      successNotify: (_, params) =>
        addToast({
          key: `sijoittelun-tulokset-updated-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: params.message,
          type: 'success',
        }),
      notifyMassStatusChange: ({ context }) =>
        addToast({
          key: `sijoittelun-tulokset-mass-status-change-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: 'sijoittelun-tulokset.mass-status-change-done',
          type: 'success',
          messageParams: { amount: context.massChangeAmount ?? 0 },
        }),
      errorModal: (_, params) =>
        showModal(SijoittelunTulosErrorModalDialog, {
          error: params.error,
          hakemukset,
        }),
    },
    actors: {
      updateHakemukset: fromPromise(
        async ({
          input,
        }: {
          input: {
            changed: Array<SijoittelunHakemusValintatiedoilla>;
            original: Array<SijoittelunHakemusValintatiedoilla>;
          };
        }) => {
          await saveMaksunTilanMuutokset(
            hakukohdeOid,
            input.changed,
            input.original,
          );
          return saveSijoitteluAjonTulokset(
            valintatapajonoOid,
            hakukohdeOid,
            lastModified,
            input.changed,
          );
        },
      ),
      publish: fromPromise(() => hyvaksyValintaEsitys(valintatapajonoOid)),
    },
  });
};
