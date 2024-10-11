import { Toast } from '@/app/hooks/useToaster';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { assign, createMachine, fromPromise } from 'xstate';

export type SijoittelunTuloksetContext = {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  changedHakemukset: SijoittelunHakemusValintatiedoilla[];
  toastMessage?: string;
};

export enum SijoittelunTuloksetStates {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  ERROR = 'ERROR',
}

export enum SijoittelunTuloksetEvents {
  UPDATE = 'UPDATE',
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
                    //TODO muut ehto parametrit
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
