import { Toast } from '@/app/hooks/useToaster';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { assign, createMachine, fromPromise } from 'xstate';
import {
  hakemukselleNaytetaanIlmoittautumisTila,
  hakemukselleNaytetaanVastaanottoTila,
} from './sijoittelun-tulokset-utils';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/app/lib/valinta-tulos-service';
import { clone } from 'remeda';
import { FetchError } from '@/app/lib/common';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/app/components/global-modal';

export type SijoittelunTuloksetContext = {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  changedHakemukset: SijoittelunHakemusValintatiedoilla[];
  toastMessage?: string;
  massChangeAmount?: number;
  originalHakemukset: SijoittelunHakemusValintatiedoilla[];
};

export enum SijoittelunTuloksetStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  NOTIFY_MASS_STATUS_CHANGE = 'NOTIFY_MASS_STATUS_CHANGE',
  PUBLISHING = 'PUBLISHING',
  UPDATING_AND_THEN_PUBLISH = 'UPDATING_AND_THEN_PUBLISH',
  PUBLISHED = 'PUBLISHED',
}

export enum SijoittelunTuloksetEvents {
  UPDATE = 'UPDATE',
  CHANGE_HAKEMUKSET_STATES = 'CHANGE_HAKEMUKSET_STATES',
  ADD_CHANGED_HAKEMUS = 'ADD_CHANGED_HAKEMUS',
  PUBLISH = 'PUBLISH',
}

export type SijoittelunTuloksetChangeEvent = {
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

export type HakemuksetStateChangeEvent = {
  hakemusOids: Set<string>;
  vastaanottoTila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
};

export const createSijoittelunTuloksetMachine = (
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemukset: SijoittelunHakemusValintatiedoilla[],
  lastModified: string,
  addToast: (toast: Toast) => void,
) => {
  const original = clone(hakemukset);
  const tuloksetMachine = createMachine({
    id: `SijoittelunTuloksetMachine-${hakukohdeOid}-${valintatapajonoOid}`,
    initial: SijoittelunTuloksetStates.IDLE,
    context: {
      hakemukset,
      changedHakemukset: [],
      originalHakemukset: original,
    } as SijoittelunTuloksetContext,
    states: {
      [SijoittelunTuloksetStates.IDLE]: {
        on: {
          [SijoittelunTuloksetEvents.ADD_CHANGED_HAKEMUS]: {
            actions: assign({
              changedHakemukset: ({ context, event }) => {
                const e = event as unknown as SijoittelunTuloksetChangeEvent;
                return updateChangedHakemus(context, e);
              },
            }),
          },
          [SijoittelunTuloksetEvents.UPDATE]: [
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
          [SijoittelunTuloksetEvents.PUBLISH]: [
            {
              guard: 'hasChangedHakemukset',
              target: SijoittelunTuloksetStates.UPDATING_AND_THEN_PUBLISH,
            },
            {
              target: SijoittelunTuloksetStates.PUBLISHING,
            },
          ],
          [SijoittelunTuloksetEvents.CHANGE_HAKEMUKSET_STATES]: {
            actions: assign(({ context, event }) => {
              const e = event as unknown as HakemuksetStateChangeEvent;
              return massUpdateChangedHakemukset(context, e);
            }),
            target: SijoittelunTuloksetStates.NOTIFY_MASS_STATUS_CHANGE,
          },
        },
      },
      [SijoittelunTuloksetStates.UPDATING]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => ({
            changed: context.changedHakemukset,
            original: context.originalHakemukset,
          }),
          onDone: {
            target: SijoittelunTuloksetStates.UPDATE_COMPLETED,
          },
          onError: {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => event,
            },
          },
        },
      },
      [SijoittelunTuloksetStates.UPDATING_AND_THEN_PUBLISH]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => ({
            changed: context.changedHakemukset,
            original: context.originalHakemukset,
          }),
          onDone: {
            target: SijoittelunTuloksetStates.PUBLISHING,
          },
          onError: {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'errorModal',
              params: ({ event }) => event,
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
              params: ({ event }) => event,
            },
          },
        },
      },
      [SijoittelunTuloksetStates.NOTIFY_MASS_STATUS_CHANGE]: {
        always: [
          {
            target: SijoittelunTuloksetStates.IDLE,
            actions: 'notifyMassStatusChange',
          },
        ],
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
    },
  });

  return tuloksetMachine.provide({
    guards: {
      hasChangedHakemukset: ({ context }) =>
        context.changedHakemukset.length > 0,
    },
    actions: {
      alert: (_, params) =>
        addToast({
          key: `sijoittelun-tulokset-update-failed-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: (params as { message: string }).message,
          type: 'error',
        }),
      successNotify: (_, params) =>
        addToast({
          key: `sijoittelun-tulokset-updated-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: (params as { message: string }).message,
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
          error: (params as { error: Error }).error as Error,
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
  e: SijoittelunTuloksetChangeEvent,
): SijoittelunHakemusValintatiedoilla[] => {
  let hakenut = context.changedHakemukset.find(
    (h) => h.hakemusOid === e.hakemusOid,
  );
  const existing: boolean = Boolean(hakenut);
  hakenut =
    hakenut || context.hakemukset.find((h) => h.hakemusOid === e.hakemusOid);
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

    if (existing) {
      if (
        isUnchanged(
          context.originalHakemukset.find(
            (h) => h.hakemusOid === hakenut.hakemusOid,
          )!,
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
      return [...context.changedHakemukset, ...[hakenut]];
    }
  }
  return context.changedHakemukset;
};

const massUpdateChangedHakemukset = (
  context: SijoittelunTuloksetContext,
  e: HakemuksetStateChangeEvent,
) => {
  let changed: SijoittelunHakemusValintatiedoilla[] = context.changedHakemukset;
  let changedAmount = 0;
  e.hakemusOids.forEach((hakemusOid) => {
    let hakenut = changed.find((h) => h.hakemusOid === hakemusOid);
    const existing: boolean = Boolean(hakenut);
    hakenut =
      hakenut || context.hakemukset.find((h) => h.hakemusOid === hakemusOid);
    if (
      hakenut &&
      ((e.ilmoittautumisTila !== hakenut.ilmoittautumisTila &&
        hakemukselleNaytetaanIlmoittautumisTila(hakenut)) ||
        (e.vastaanottoTila !== hakenut.vastaanottotila &&
          hakemukselleNaytetaanVastaanottoTila(hakenut)))
    ) {
      hakenut.vastaanottotila = e.vastaanottoTila ?? hakenut.vastaanottotila;
      hakenut.ilmoittautumisTila =
        e.ilmoittautumisTila ?? hakenut.ilmoittautumisTila;
      changedAmount++;
      if (existing) {
        if (
          isUnchanged(
            context.originalHakemukset.find(
              (h) => h.hakemusOid === hakenut.hakemusOid,
            )!,
            hakenut,
          )
        ) {
          changed = changed.filter((h) => h.hakemusOid !== hakenut.hakemusOid);
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
