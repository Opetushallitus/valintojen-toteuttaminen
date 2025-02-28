import { Toast } from '@/app/hooks/useToaster';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/app/lib/valinta-tulos-service';
import { clone } from 'remeda';
import { FetchError } from '@/app/lib/common';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/app/components/global-modal';
import {
  isImoittautuminenPossible,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { useSelector } from '@xstate/react';

export type SijoittelunTuloksetContext = {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  changedHakemukset: SijoittelunHakemusValintatiedoilla[];
  hakemuksetForUpdate?: SijoittelunHakemusValintatiedoilla[];
  massChangeAmount?: number;
};

export enum SijoittelunTuloksetStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  PUBLISHING = 'PUBLISHING',
  UPDATING_AND_THEN_PUBLISH = 'UPDATING_AND_THEN_PUBLISH',
  PUBLISHED = 'PUBLISHED',
}

export enum SijoittelunTuloksetEventTypes {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  CHANGE_HAKEMUKSET_STATES = 'CHANGE_HAKEMUKSET_STATES',
  ADD_CHANGED_HAKEMUS = 'ADD_CHANGED_HAKEMUS',
  PUBLISH = 'PUBLISH',
}

export type SijoittelunTulosUpdateEvent = {
  type: SijoittelunTuloksetEventTypes.UPDATE;
};

export type HakemuksetStateChangeParams = {
  hakemusOids: Set<string>;
  vastaanottoTila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
};

/**
 * Massapäivitys parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type SijoittelunTulosMassUpdateEvent = {
  type: SijoittelunTuloksetEventTypes.MASS_UPDATE;
} & HakemuksetStateChangeParams;

export type SijottelunTulosMassChangeEvent = {
  type: SijoittelunTuloksetEventTypes.CHANGE_HAKEMUKSET_STATES;
} & HakemuksetStateChangeParams;

export type SijoittelunTulosChangeParams = {
  hakemusOid: string;
  julkaistavissa?: boolean;
  ehdollisestiHyvaksyttavissa?: boolean;
  ehdollisuudenSyy?: string;
  ehdollisuudenSyyKieli?: { fi?: string; en?: string; sv?: string };
  vastaanottotila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
  maksunTila?: MaksunTila;
  hyvaksyttyVarasijalta?: boolean;
};

export type SijoittelunTulosChangeEvent = {
  type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS;
} & SijoittelunTulosChangeParams;

export type SijoittelunTulosPublishEvent = {
  type: SijoittelunTuloksetEventTypes.PUBLISH;
};

export type SijoittelunTuloksetEvents =
  | SijoittelunTulosUpdateEvent
  | SijoittelunTulosChangeEvent
  | SijottelunTulosMassChangeEvent
  | SijoittelunTulosPublishEvent
  | SijoittelunTulosMassUpdateEvent;

const hasChangedHakemukset = ({
  context,
}: {
  context: SijoittelunTuloksetContext;
}) => context.changedHakemukset.length > 0;

export const createSijoittelunTuloksetMachine = (
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemukset: SijoittelunHakemusValintatiedoilla[],
  lastModified: string,
  addToast: (toast: Toast) => void,
  onUpdateSuccess?: () => void,
) => {
  const tuloksetMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAQQooH0BhACQYDkBxG1lwDSNALIBVAMoBtAAwBdRKAAOAe1i4ALrlX4lIAB6IALAEYSATivWb1gBwA2ADQgAnieN2Sxhxd8AmfztPC2MAZmMAX0iXNCw8QlJKWjpxAAUKBgAVGjlFJBA1DW1dfSMEMLCHElkfOwB2AFZmx18fF3cEC1qSf1MHUzsIoONAxujYjBwCYnJqenTMnOlTfJV1LR09AvLGsJIwxtNmhyCrev9ZOw7EQ-8SI4dm2VN-Bx8LUwmQOOnEuZSaXEACEqGRJBw8voiptSjtblUanUmi0HG1nG4TAMHn5DrJTvU7HY3g5vr8ErNkvQgaDwZDVtCNiVtqBypVqrUHA1mo1WqEMZ1Gp4HlVPGFZJ9-OLSTEflMKUl5nRODx+CxhGJxEJJDQsixJFlsjQZApGcUtmUERzkTy+e1MQhTLV6iQ0RYwqYmrJ6mZKmT5TNSItsmQ+HQILowCQCAA3VQAayj5MDJGDWVDvAQsdUmHQzLyUIKMOZlq6Dlkru5-nCRI99QFiGCFks+KCaPLxk+-viKbTGboYAAToPVIOSMoADZ5gBmo9QJGT-z7fCz+DjufzCkL63NcNZJkOlj6RNkHuGg3qNwQdlM5je4saL3FFxlkx7S4yIb4LB4rCyHBobgWBpMEIXDSNozXBMkwDD8lgzH9uD-ACgJAulV3XPMtgLU0iyZC14TLCsuSaaswlrT0GwQYxvV6RwfDOYwGPGWVF1mZdeEQ5DAOAkFQI4Adh1Hccp00WdB3nNig0-dNv1-Fh-x4tCIQwnMsN0HC1kKfC90MA9GiPQY7FPUxzwaK8qi8d4wj6epKheRx-G7P5ZmUjh+wjQhILjRMF1g1y+LpDNVI3bCt1wndYRZPTHVGCtugcZ8mnqUzGivfw7N6LkpUsiJfHqZyFRINz+yHEcx0nGc5z898AtpCFguzUKNPCrTiwI-dHVPF1-EfZ1jL8Rp-HSt5XXbR8uVMsJ6j8QqU24AB5dMADEAE0WFEBhJEkfVDSyKR2C4Ph6G3bTd2i8pwhdIUSLebo9lkYaHQsIUSBSgZgkuCx3osOb-jcgQ6FO9rdPKUw4pbRLvWS1Kr2CV1uiuGibJCC4-vYmSaHYBbRDSWgcgoIGIrOqLSydUb60aN0rhmzsrzdOj3iGTwL0JaJZXwVQIDgfQpLNUnCIAWg5WRRbF8XRfBq9hZqCW5dFgrWP8xVaH5ktCKdLxHoiMI-FqFG+ivIVm1GIIIiYypTBe9HpPgvg1Y6mKHHqHrPmd91EouCxrgdYkDJo047Efb7PSOG3UxkhD5MU1DAohB3QcQNFjAeL3xWMet3QiCziTe+jhgygYMvDkr7bw86ya+kgb3eIULgibownS4V62JWRH36AYrHDxaVvWzbtt27IDpVY6E4upPEtdXrRZe3x+R9zpvZTobyx9Ow-BeqmS7jgCKHHsneX2bl28+8VDd98w+peQv3RvX6ldq22jWx3H8YEA+Nat5s7KYq2mnIocJuDp2w1FxLrUIbwZosWiEAA */
    id: `SijoittelunTuloksetMachine-${hakukohdeOid}-${valintatapajonoOid}`,
    initial: SijoittelunTuloksetStates.IDLE,
    types: {} as {
      context: SijoittelunTuloksetContext;
      events: SijoittelunTuloksetEvents;
      actions:
        | { type: 'alert'; params: { message: string } }
        | { type: 'successNotify'; params: { message: string } }
        | { type: 'errorModal'; params: { error: Error } }
        | { type: 'notifyMassStatusChange' }
        | { type: 'updateSuccess' };
    },
    context: {
      hakemukset: clone(hakemukset),
      hakemuksetForUpdate: undefined,
      changedHakemukset: [],
    },
    states: {
      [SijoittelunTuloksetStates.IDLE]: {
        on: {
          [SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS]: {
            actions: assign({
              changedHakemukset: ({ context, event }) => {
                return updateChangedHakemus(context, event);
              },
            }),
          },
          [SijoittelunTuloksetEventTypes.MASS_UPDATE]: [
            {
              target: SijoittelunTuloksetStates.UPDATING,
              actions: assign({
                hakemuksetForUpdate: ({ context, event }) => {
                  return context.hakemukset.reduce((acc, h) => {
                    const shouldOverride = event.hakemusOids.has(h.hakemusOid);

                    return shouldOverride
                      ? [
                          ...acc,
                          {
                            ...h,
                            ilmoittautumisTila:
                              event.ilmoittautumisTila ?? h.ilmoittautumisTila,
                            vastaanottotila:
                              event.vastaanottoTila ?? h.vastaanottotila,
                          },
                        ]
                      : acc;
                  }, [] as SijoittelunHakemusValintatiedoilla[]);
                },
              }),
            },
          ],
          [SijoittelunTuloksetEventTypes.UPDATE]: [
            {
              guard: 'hasChangedHakemukset',
              target: SijoittelunTuloksetStates.UPDATING,
            },
            {
              target: SijoittelunTuloksetStates.IDLE,
              actions: {
                type: 'alert',
                params: { message: 'virhe.eimuutoksia' },
              },
            },
          ],
          [SijoittelunTuloksetEventTypes.PUBLISH]: [
            {
              guard: 'hasChangedHakemukset',
              target: SijoittelunTuloksetStates.UPDATING_AND_THEN_PUBLISH,
            },
            {
              target: SijoittelunTuloksetStates.PUBLISHING,
            },
          ],
          [SijoittelunTuloksetEventTypes.CHANGE_HAKEMUKSET_STATES]: {
            actions: [
              assign(({ context, event }) => {
                return massUpdateChangedHakemukset(context, event);
              }),
              'notifyMassStatusChange',
            ],
          },
        },
      },
      [SijoittelunTuloksetStates.UPDATING]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => ({
            changed: context.hakemuksetForUpdate ?? context.changedHakemukset,
            original: context.hakemukset,
          }),
          onDone: {
            target: SijoittelunTuloksetStates.UPDATE_COMPLETED,
          },
          onError: {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => ({
                error: event.error as Error,
              }),
            },
          },
        },
      },
      [SijoittelunTuloksetStates.UPDATING_AND_THEN_PUBLISH]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => ({
            changed: context.changedHakemukset,
            original: context.hakemukset,
          }),
          onDone: {
            target: SijoittelunTuloksetStates.PUBLISHING,
          },
          onError: {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => {
                return {
                  error: event.error as Error,
                };
              },
            },
          },
        },
      },
      [SijoittelunTuloksetStates.PUBLISHING]: {
        invoke: {
          src: 'publish',
          onDone: {
            target: SijoittelunTuloksetStates.PUBLISHED,
          },
          onError: {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => ({ error: event.error as Error }),
            },
          },
        },
      },
      [SijoittelunTuloksetStates.PUBLISHED]: {
        always: [
          {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'successNotify',
              params: { message: 'sijoittelun-tulokset.hyvaksytty' },
            },
          },
        ],
        entry: [
          'updateSuccess',
          assign({
            hakemukset: ({ context }) =>
              context.hakemukset.map((h) => {
                const changed = context.changedHakemukset.find(
                  (c) => c.hakemusOid === h.hakemusOid,
                );
                return changed ?? h;
              }),
          }),
          assign({
            changedHakemukset: [],
          }),
        ],
      },
      [SijoittelunTuloksetStates.UPDATE_COMPLETED]: {
        always: [
          {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'successNotify',
              params: { message: 'sijoittelun-tulokset.valmis' },
            },
          },
        ],
        entry: [
          'updateSuccess',
          assign({
            hakemukset: ({ context }) =>
              // FIXME: Hakemusten muokkaaminen voi onnistua osittain
              // Pitää päivittää vain ne hakemukset, joita onnistuttiin muokkaamaan
              // Tarvitaan uusi lastModified-tieto
              context.hakemukset.map((h) => {
                const override = context.hakemuksetForUpdate?.find(
                  (c) => c.hakemusOid === h.hakemusOid,
                );
                const changed = context.changedHakemukset.find(
                  (c) => c.hakemusOid === h.hakemusOid,
                );
                return override ?? changed ?? h;
              }),
          }),
          assign({
            changedHakemukset: ({ context }) =>
              context.changedHakemukset.filter((h) => {
                const original = context.hakemukset.find(
                  (h2) => h2.hakemusOid === h.hakemusOid,
                )!;
                return !isUnchanged(h, original);
              }),
            hakemuksetForUpdate: undefined,
          }),
        ],
      },
    },
  });

  return tuloksetMachine.provide({
    guards: {
      hasChangedHakemukset,
    },
    actions: {
      updateSuccess: () => {
        onUpdateSuccess?.();
      },
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
        ({
          input,
        }: {
          input: {
            changed: SijoittelunHakemusValintatiedoilla[];
            original: SijoittelunHakemusValintatiedoilla[];
          };
        }) => {
          return tryAndParseError(async () => {
            await saveMaksunTilanMuutokset(
              hakukohdeOid,
              input.changed,
              input.original,
            );
            return await saveSijoitteluAjonTulokset(
              valintatapajonoOid,
              hakukohdeOid,
              lastModified,
              input.changed,
            );
          });
        },
      ),
      publish: fromPromise(() => {
        return tryAndParseError(async () => {
          await hyvaksyValintaEsitys(valintatapajonoOid);
        });
      }),
    },
  });
};

const tryAndParseError = async (wrappedFn: () => Promise<void>) => {
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

const updateChangedHakemus = (
  context: SijoittelunTuloksetContext,
  e: SijoittelunTulosChangeEvent,
): SijoittelunHakemusValintatiedoilla[] => {
  let hakenut = context.changedHakemukset.find(
    (h) => h.hakemusOid === e.hakemusOid,
  );
  const changedExists = Boolean(hakenut);
  hakenut = clone(
    hakenut || context.hakemukset.find((h) => h.hakemusOid === e.hakemusOid),
  );

  if (hakenut) {
    if (e.julkaistavissa !== undefined) {
      hakenut.julkaistavissa = e.julkaistavissa;
    }
    if (e.ehdollisestiHyvaksyttavissa !== undefined) {
      hakenut.ehdollisestiHyvaksyttavissa = e.ehdollisestiHyvaksyttavissa;
    }
    if (e.ehdollisuudenSyy) {
      hakenut.ehdollisenHyvaksymisenEhtoKoodi = e.ehdollisuudenSyy;
    }
    if (e.ehdollisuudenSyyKieli) {
      hakenut.ehdollisenHyvaksymisenEhtoFI = e.ehdollisuudenSyyKieli.fi;
      hakenut.ehdollisenHyvaksymisenEhtoSV = e.ehdollisuudenSyyKieli.sv;
      hakenut.ehdollisenHyvaksymisenEhtoEN = e.ehdollisuudenSyyKieli.en;
    }
    if (e.hyvaksyttyVarasijalta !== undefined) {
      hakenut.hyvaksyttyVarasijalta = e.hyvaksyttyVarasijalta;
    }
    if (e.vastaanottotila) {
      hakenut.vastaanottotila = e.vastaanottotila;
    }
    if (e.ilmoittautumisTila) {
      hakenut.ilmoittautumisTila = e.ilmoittautumisTila;
    }
    if (e.maksunTila) {
      hakenut.maksuntila = e.maksunTila;
    }

    if (changedExists) {
      if (
        isUnchanged(
          context.hakemukset.find((h) => h.hakemusOid === hakenut.hakemusOid)!,
          hakenut,
        )
      ) {
        return context.changedHakemukset.filter(
          (h) => h.hakemusOid !== hakenut.hakemusOid,
        );
      }
      return context.changedHakemukset.map((h) =>
        h.hakemusOid === e.hakemusOid ? hakenut : h,
      );
    } else {
      return [...context.changedHakemukset, hakenut];
    }
  }
  return context.changedHakemukset;
};

const massUpdateChangedHakemukset = (
  context: SijoittelunTuloksetContext,
  e: HakemuksetStateChangeParams,
) => {
  let changed: SijoittelunHakemusValintatiedoilla[] = clone(
    context.changedHakemukset,
  );
  let changedAmount = 0;
  e.hakemusOids.forEach((hakemusOid) => {
    let hakenut = changed.find((h) => h.hakemusOid === hakemusOid);
    const changedExists = Boolean(hakenut);
    const originalHakenut = context.hakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    hakenut = hakenut || originalHakenut;

    if (
      hakenut &&
      ((e.ilmoittautumisTila &&
        e.ilmoittautumisTila !== hakenut.ilmoittautumisTila &&
        isImoittautuminenPossible(hakenut)) ||
        (e.vastaanottoTila &&
          e.vastaanottoTila !== hakenut.vastaanottotila &&
          isVastaanottoPossible(hakenut)))
    ) {
      hakenut.vastaanottotila = e.vastaanottoTila ?? hakenut.vastaanottotila;
      hakenut.ilmoittautumisTila =
        e.ilmoittautumisTila ?? hakenut.ilmoittautumisTila;
      changedAmount++;
      if (changedExists) {
        if (isUnchanged(originalHakenut!, hakenut)) {
          changed = changed.filter((h) => h.hakemusOid !== hakemusOid);
        } else {
          changed = changed.map((h) =>
            h.hakemusOid === hakemusOid ? hakenut : h,
          );
        }
      } else {
        changed.push(hakenut);
      }
    }
  });
  return {
    changedHakemukset: changed,
    massChangeAmount: changedAmount,
  };
};

const isUnchanged = (
  original: SijoittelunHakemusValintatiedoilla,
  changed: SijoittelunHakemusValintatiedoilla,
): boolean => {
  return (
    original.ehdollisenHyvaksymisenEhtoEN ===
      changed.ehdollisenHyvaksymisenEhtoEN &&
    original.ehdollisenHyvaksymisenEhtoFI ===
      changed.ehdollisenHyvaksymisenEhtoFI &&
    original.ehdollisenHyvaksymisenEhtoSV ===
      changed.ehdollisenHyvaksymisenEhtoSV &&
    original.ehdollisestiHyvaksyttavissa ===
      changed.ehdollisestiHyvaksyttavissa &&
    original.ilmoittautumisTila === changed.ilmoittautumisTila &&
    original.vastaanottotila === changed.vastaanottotila &&
    original.julkaistavissa === changed.julkaistavissa &&
    original.maksuntila === changed.maksuntila &&
    original.hyvaksyttyVarasijalta === changed.hyvaksyttyVarasijalta
  );
};

export type SijoittelunTulosActorRef = ActorRefFrom<
  ReturnType<typeof createSijoittelunTuloksetMachine>
>;

export const useIsDirtySijoittelunTulos = (
  sijoittelunTulosActorRef: SijoittelunTulosActorRef,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
