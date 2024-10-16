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

export type SijoittelunTuloksetContext = {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  changedHakemukset: SijoittelunHakemusValintatiedoilla[];
  toastMessage?: string;
  massChangeAmount?: number;
};

export enum SijoittelunTuloksetStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  ERROR = 'ERROR',
  NOTIFY_MASS_STATUS_CHANGE = 'NOTIFY_MASS_STATUS_CHANGE',
}

export enum SijoittelunTuloksetEvents {
  UPDATE = 'UPDATE',
  CHANGE_HAKEMUKSET_STATES = 'CHANGE_HAKEMUKSET_STATES',
  ADD_CHANGED_HAKEMUS = 'ADD_CHANGED_HAKEMUS',
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
  hakuOid: string,
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemukset: SijoittelunHakemusValintatiedoilla[],
  addToast: (toast: Toast) => void,
) => {
  const tuloksetMachine = createMachine({
    id: `SijoittelunTuloksetMachine-${hakukohdeOid}-${valintatapajonoOid}`,
    initial: SijoittelunTuloksetStates.IDLE,
    context: {
      hakemukset,
      changedHakemukset: [],
    } as SijoittelunTuloksetContext,
    states: {
      [SijoittelunTuloksetStates.IDLE]: {
        on: {
          [SijoittelunTuloksetEvents.ADD_CHANGED_HAKEMUS]: {
            actions: assign({
              changedHakemukset: ({ context, event }) => {
                const e = event as unknown as SijoittelunTuloksetChangeEvent;
                let hakenut = context.changedHakemukset.find(
                  (h) => h.hakemusOid === e.hakemusOid,
                );
                const existing: boolean = Boolean(hakenut);
                hakenut =
                  hakenut ||
                  context.hakemukset.find(
                    (h) => h.hakemusOid === event.hakemusOid,
                  );
                if (hakenut) {
                  if (e.julkaistavissa !== undefined) {
                    hakenut.julkaistavissa = e.julkaistavissa;
                  }
                  if (e.ehdollisestiHyvaksyttavissa !== undefined) {
                    hakenut.ehdollisestiHyvaksyttavissa =
                      e.ehdollisestiHyvaksyttavissa;
                  }
                  if (e.ehdollisuudenSyy) {
                    hakenut.ehdollisenHyvaksymisenEhtoKoodi =
                      e.ehdollisuudenSyy;
                  }
                  if (e.ehdollisuudenSyyKieli) {
                    hakenut.ehdollisenHyvaksymisenEhtoFI =
                      e.ehdollisuudenSyyKieli.fi;
                    hakenut.ehdollisenHyvaksymisenEhtoSV =
                      e.ehdollisuudenSyyKieli.sv;
                    hakenut.ehdollisenHyvaksymisenEhtoEN =
                      e.ehdollisuudenSyyKieli.en;
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
                    return context.changedHakemukset.map((h) =>
                      h.hakemusOid === e.hakemusOid ? hakenut : h,
                    );
                  } else {
                    return [...context.changedHakemukset, ...[hakenut]];
                  }
                }
                return context.changedHakemukset;
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
          [SijoittelunTuloksetEvents.CHANGE_HAKEMUKSET_STATES]: {
            actions: assign(({ context, event }) => {
              const e = event as unknown as HakemuksetStateChangeEvent;
              const changed: SijoittelunHakemusValintatiedoilla[] =
                context.changedHakemukset;
              let changedAmount = 0;
              e.hakemusOids.forEach((hakemusOid) => {
                let hakenut = changed.find((h) => h.hakemusOid === hakemusOid);
                const existing: boolean = Boolean(hakenut);
                hakenut =
                  hakenut ||
                  context.hakemukset.find((h) => h.hakemusOid === hakemusOid);
                if (
                  hakenut &&
                  ((e.ilmoittautumisTila !== hakenut.ilmoittautumisTila &&
                    hakemukselleNaytetaanIlmoittautumisTila(hakenut)) ||
                    (e.vastaanottoTila !== hakenut.vastaanottotila &&
                      hakemukselleNaytetaanVastaanottoTila(hakenut)))
                ) {
                  hakenut.vastaanottotila =
                    e.vastaanottoTila ?? hakenut.vastaanottotila;
                  hakenut.ilmoittautumisTila =
                    e.ilmoittautumisTila ?? hakenut.ilmoittautumisTila;
                  changedAmount++;
                  if (existing) {
                    changed.map((h) =>
                      h.hakemusOid === hakemusOid ? hakenut : h,
                    );
                  } else {
                    changed.push(hakenut);
                  }
                }
              });
              return {
                changedHakemukset: changed,
                massChangeAmount: changedAmount,
              };
            }),
            target: SijoittelunTuloksetStates.NOTIFY_MASS_STATUS_CHANGE,
          },
        },
      },
      [SijoittelunTuloksetStates.UPDATING]: {
        invoke: {
          src: 'updateHakemukset',
          input: ({ context }) => context.changedHakemukset,
          onDone: {
            target: SijoittelunTuloksetStates.UPDATE_COMPLETED,
          },
          onError: {
            target: SijoittelunTuloksetStates.ERROR,
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
      [SijoittelunTuloksetStates.ERROR]: {
        always: [
          {
            target: SijoittelunTuloksetStates.IDLE,
            actions: {
              type: 'alert',
              params: { message: 'virhe.tallennus' },
            },
          },
        ],
      },
      [SijoittelunTuloksetStates.UPDATE_COMPLETED]: {
        always: [
          {
            target: SijoittelunTuloksetStates.IDLE,
            actions: 'successNotify',
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
      successNotify: () =>
        addToast({
          key: `sijoittelun-tulokset-updated-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: 'sijoittelun-tulokset.valmis',
          type: 'success',
        }),
      notifyMassStatusChange: ({ context }) =>
        addToast({
          key: `sijoittelun-tulokset-mass-status-change-for-${hakukohdeOid}-${valintatapajonoOid}`,
          message: 'sijoittelun-tulokset.mass-status-change-done',
          type: 'success',
          messageParams: { amount: context.massChangeAmount ?? 0 },
        }),
    },
    actors: {
      updateHakemukset: fromPromise(
        ({ input }: { input: SijoittelunHakemusValintatiedoilla[] }) => {
          return Promise.resolve(input); //TODO:
        },
      ),
    },
  });
};
