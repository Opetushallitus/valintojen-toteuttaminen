import { Toast } from '@/hooks/useToaster';
import {
  ActorRefFrom,
  assign,
  createMachine,
  fromPromise,
  PromiseActorLogic,
} from 'xstate';
import { clone } from 'remeda';
import {
  applyMassHakemusChanges,
  applySingleHakemusChange,
  hasChangedHakemukset,
  ValinnanTulosEditableFields,
} from './valinnan-tulos-machine-utils';
import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';
import { Hakemus } from '../ataru/ataru-types';
import { hyvaksyValintaEsitys } from '../valinta-tulos-service/valinta-tulos-service';

export type MinimalHakemusInfo = Pick<
  Hakemus,
  'hakijaOid' | 'hakemusOid' | 'hakijanNimi'
>;

export type ValinnanTulosContext<T extends HakemuksenValinnanTulos> = {
  addToast?: (toast: Toast) => void;
  onUpdated?: () => void;
  hakukohdeOid?: string;
  valintatapajonoOid?: string;
  lastModified?: string;
  hakemukset: Array<T>;
  changedHakemukset: Array<T>;
  hakemuksetForMassUpdate?: Array<T>;
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

export type ValinnanTulosMachineParams<T extends HakemuksenValinnanTulos> = {
  hakukohdeOid: string;
  valintatapajonoOid?: string;
  hakemukset: Array<T>;
  lastModified?: string;
  addToast: (toast: Toast) => void;
  /**
   * Kutsutaan, jos ainakin osa hakemuksista saatiin päivitettyä onnistuneesti.
   */
  onUpdated?: () => void;
};

export type ValinnanTulosResetEvent<T extends HakemuksenValinnanTulos> = {
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

export type ValinnanTuloksetEvents<T extends HakemuksenValinnanTulos> =
  | ValinnanTulosUpdateEvent
  | ValinnanTulosChangeEvent
  | ValinnanTulosMassChangeEvent
  | ValinnanTulosPublishEvent
  | ValinnanTulosMassUpdateEvent
  | ValinnanTulosResetEvent<T>;

export type ValinnanTulosActorRef<
  T extends HakemuksenValinnanTulos = HakemuksenValinnanTulos,
> = ActorRefFrom<ReturnType<typeof createValinnanTulosMachine<T>>>;

export function createValinnanTulosMachine<
  T extends HakemuksenValinnanTulos,
>() {
  return createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCGAbAlgO267AKgK7oD2A1rGAC4CyqAxgBY5gDEASgKIDKXBAbQAMAXUSgADqViZqmUtnEgAHogAcAdgBsAOgAsavQGZjATiNqhAJgCsegDQgAnogCMVgL4fHaLLnzEZJQ09MysOgCSACIAMlxsAMIAEgCCAHIA4lzCYkggUjJyCkqqCK5CrjpGQnpaahYaQkauGq6OLgimWno6VlYaeu6WVnp62l4+GDh4hCQUVHSMLNhgkbHxtCk8PAD6yelZOUoFsvKKeaU2VjquRlZqI6Y2jaZqNjbt6oM6D66uWn1TKZXHp7hMQL5pgE5sFFmEVms4mxNtsdgBVAAKURSBGyomO0lOxQuiCMFiqxgGTT+Jn+Wk+CG0ulamlcalMrRaajU4Mh-lmQQWoWWq2iSMx2NxRzyJyK51ApTJagpRipzVugy09Oc6gBOi0LKMWmsqrUAN5U35gXmISW4TF8QlOOyrlykkJcpKiFqOiBfv9-rNDIGNh+dSatTsRnMRgtfhm1thwvt6zYGLRACEYhEeElpe7CmcvQglSq1TTNdqOsCjDcWc93gMtXo41CBTa4SLEfF01mc3nXQTC8SFaTySZVXpqRq6QyTKGtDYAVpqpZulYja2rTChXaEU6CBFMmwIApVjgAG4UVZ8hM723w1YHo8ZBCX0gMVBynL5-Ieoskp0Vi6K8xhkiCrjmMBDJvBoNxWGydg2NUoy1Fud6Cg+XbPseYAAE54aQeE6BI6BfgAZkRAC2Oi3tCmGduEOGvu+n7fqIv6ygBo4IMYyoIZooLmBoG73EYDIAkIPw2MJphWBUtiDOh9Edsm+5Ys6ewAPK0BicS4lEbCcf+I4qG4RqmPoyFCAaqrWMYVgwQhOgiWaRh2IuG4rsp7ZJnuT4abi2m6fpXCGQIg4yiZ8pmZ05g6DZIwaE80ZCNYDK1LoU4AlcWrNK8tg+Ymu6PjovbZrmL4nmeOjvuQN6Whhqn+WVmYVUkL5vtgV5sWcP74lFw4xaUIIri5ehAjYtxvEIuUMuUNjKiChg2dG5gPLG3gQo1Kl+aV5X9lV+GEcRpEUdRtE7b5JVdgdlWZF1PVfn1HEDQWRLDW4Yw9BuxhCBohiyfNDxWc0k7AeUJpeFt2CkBAcBKHR11YawQ4fcWAC0lRpTjuO4yCjk6p0PQpbcVimFODw1BoRX3oxCIOmjnqAeUlQGmyrQ2YYqrIfNNmhmys2QcB5PuKYtMMWpAWSi+TPcbFBqhnJbKTv9ri80T9TXACiGNHY2hAhLzWlQeXDBXp-BhXLpkjerujTuy7gaLlGgwZBvRC1B0aKS2W1I8VKMIndHWZNbn1lCuzJslqQgcu5GgiTBsc3O8kETRNFMTdDHhAA */
    id: 'ValinnanTulosMachine',
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
      changedHakemukset: [],
    },
    on: {
      [ValinnanTulosEventType.RESET]: {
        target: '.IDLE',
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
                return context.hakemukset.reduce((result, tulos) => {
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
            changed:
              context.hakemuksetForMassUpdate ?? context.changedHakemukset,
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
    actors: {
      publish: fromPromise(async ({ input }) => {
        if (!input.valintatapajonoOid) {
          throw new Error(
            'ValinnanTulosMachine.publish: Missing required parameters',
          );
        }
        await hyvaksyValintaEsitys(input.valintatapajonoOid);
      }),
    },
  });
}
