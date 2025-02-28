import { Toast } from '@/app/hooks/useToaster';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { assign, createMachine, fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/app/lib/valinta-tulos-service';
import { clone } from 'remeda';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/app/components/global-modal';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { useSelector } from '@xstate/react';
import {
  HakemuksetStateChangeParams,
  SijoittelunTuloksetContext,
  SijoittelunTuloksetEvents,
  SijoittelunTuloksetEventType,
  SijoittelunTuloksetState,
  SijoittelunTulosActorRef,
  SijoittelunTulosChangeEvent,
  SijoittelunTulosEditableFields,
} from './sijoittelun-tulokset-state-types';
import { OphApiError } from '@/app/lib/common';

const hasChangedHakemukset = ({
  context,
}: {
  context: SijoittelunTuloksetContext;
}) => context.changedHakemukset.length > 0;

/**
 * Palauttaa päivitetyn hakemukset-taulukon. Korvataan alkuperäisessä datassa päivitetyt hakemukset muuttuneilla.
 * Ei päivitetä, jos tallennuksessa tapahtui virhe (hakemuksen oid löytyy erroredHakemusOids-taulukosta).
 */
const updateHakemuksetWithChanges = (
  context: SijoittelunTuloksetContext,
  erroredHakemusOids: Array<string> = [],
) => {
  return context.hakemukset.map((hakemus) => {
    if (erroredHakemusOids.includes(hakemus.hakemusOid)) {
      return hakemus;
    }

    const isOverride = context.hakemuksetForMassUpdate !== undefined;

    if (isOverride) {
      return (
        context.hakemuksetForMassUpdate?.find(
          (c) => c.hakemusOid === hakemus.hakemusOid,
        ) ?? hakemus
      );
    } else {
      return (
        context.changedHakemukset.find(
          (c) => c.hakemusOid === hakemus.hakemusOid,
        ) ?? hakemus
      );
    }
  });
};

/**
 * Palauttaa päivitetyn changedHakemukset-taulukon. Jos muuttunut hakemus on arvoiltaan sama kuin alkuperäinen, poistetaan changedHakemukset-taulukosta.
 */
const updateChangedHakemukset = (context: SijoittelunTuloksetContext) => {
  return context.changedHakemukset.filter((changedHakemus) => {
    const original = context.hakemukset.find(
      (hakemus) => hakemus.hakemusOid === changedHakemus.hakemusOid,
    );
    return original && !isUnchanged(changedHakemus, original);
  });
};

export const createSijoittelunTuloksetMachine = (
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>,
  lastModified: string,
  addToast: (toast: Toast) => void,
) => {
  const tuloksetMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAQQooH0BhACQYDkBxG1lwDSNALIBVAMoBtAAwBdRKAAOAe1i4ALrlX4lIAB6IALAEYSATivWb1gBwA2ADQgAnieN2Sxhxd8AmfztPC2MAZmMAX0iXNCw8QlJKWjpxAAUKBgAVGjlFJBA1DW1dfSMEMLCHElkfOwB2AFZmx18fF3cEC1qSf1MHUzsIoONAxujYjBwCYnJqenTMnOlTfJV1LR09AvLGsJIwxtNmhyCrev9ZOw7EQ-8SI4dm2VN-Bx8LUwmQOOnEuZSaXEACEqGRJBw8voiptSjtblUanUmi0HG1nG4TAMHn5DrJTvU7HY3g5vr8ErNkvQgaDwZDVtCNiVtqBypVqrUHA1mo1WqEMZ1Gp4HlVPGFZJ9-OLSTEflMKUl5nRODx+CxhGJxEJJDQsixJFlsjQZApGcUtmUERzkTy+e1MQhTLV6iQ0RYwqYmrJ6mZKmT5TNSItsmQ+HQILowCQCAA3VQAayj5MDJGDWVDvAQsdUmHQzLyUIKMOZlq6Dlkru5-nCRI99QFiGCFks+KCaPLxk+-viKbTGboYAAToPVIOSMoADZ5gBmo9QJGT-z7fCz+DjufzCkL63NcNZJkOlj6RNkHuGg3qNwQdlM5je4saL3FFxlkx7S4yIb4LB4rCyHBobgWBpMEIXDSNozXBMkwDD8lgzH9uD-ACgJAulV3XPMtgLU0iyZC14TLCsuSaaswlrT0GwQYxvV6RwfDOYwGPGWVF1mZdeEQ5DAOAkFQI4Adh1Hccp00WdB3nNig0-dNv1-Fh-x4tCIQwnMsN0HC1kKfC90MA9GiPQY7FPUxzwaK8qi8d4wj6epKheRx-G7P5ZmUjh+wjQhILjRMF1g1y+LpDNVI3bCt1wndYRZPTHVGCtugcZ8mnqUzGivfw7N6LkpUsiJfHqZyFRINz+yHEcx0nGc5z898AtpCFguzUKNPCrTiwI-dHVPF1-EfZ1jL8Rp-HSt5XXbR8uVMsJ6j8QqU24AB5dMADEAE0WFEBhJEkfVDSyKR2C4Ph6G3bTd2i8pwhdIUSLebo9lkYaHQsIUSBSgZgkuCx3osOb-jcgQ6FO9rdPKUw4pbRLvWS1Kr2CV1uiuGibJCC4-vYmSaHYBbRDSWgcgoIGIrOqLSydUb60aN0rhmzsrzdOj3iGTwL0JaJZXwVQIDgfQpLNUnCIAWg5WRRbF8XRfBq9hZqCW5dFgrWP8xVaH5ktCKdLxHoiMI-FqFG+ivIVm1GIIIiYypTBe9HpPgvg1Y6mKHHqHrPmd91EouCxrgdYkDJo047Efb7PSOG3UxkhD5MU1DAohB3QcQNFjAeL3xWMet3QiCziTe+jhgygYMvDkr7bw86ya+kgb3eIULgibownS4V62JWRH36AYrHDxaVvWzbtt27IDpVY6E4upPEtdXrRZe3x+R9zpvZTobyx9Ow-BeqmS7jgCKHHsneX2bl28+8VDd98w+peQv3RvX6ldq22jWx3H8YEA+Nat5s7KYq2mnIocJuDp2w1FxLrUIbwZosWiEAA */
    id: `SijoittelunTuloksetMachine-${hakukohdeOid}-${valintatapajonoOid}`,
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
                return updateChangedHakemus(context, event);
              },
            }),
          },
          [SijoittelunTuloksetEventType.MASS_CHANGE]: {
            actions: [
              assign(({ context, event }) => {
                return massUpdateChangedHakemukset(context, event);
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
                    return updateHakemuksetWithChanges(
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
                  updateChangedHakemukset(context),
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
            hakemukset: ({ context }) => updateHakemuksetWithChanges(context),
          }),
          assign({
            changedHakemukset: ({ context }) =>
              updateChangedHakemukset(context),
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

const SIJOITTELUN_TULOS_EDITABLE_FIELDS = [
  'julkaistavissa',
  'ehdollisestiHyvaksyttavissa',
  'ehdollisenHyvaksymisenEhtoKoodi',
  'ehdollisenHyvaksymisenEhtoFI',
  'ehdollisenHyvaksymisenEhtoSV',
  'ehdollisenHyvaksymisenEhtoEN',
  'hyvaksyttyVarasijalta',
  'vastaanottotila',
  'ilmoittautumisTila',
  'maksuntila',
] as const;

const assignHakemusChanges = ({
  changedHakemukset,
  originalHakenut,
  event,
}: {
  changedHakemukset: SijoittelunTuloksetContext['changedHakemukset'];
  originalHakenut: SijoittelunHakemusValintatiedoilla;
  event: SijoittelunTulosEditableFields;
}) => {
  const changedHakenut = changedHakemukset.find(
    (h) => h.hakemusOid === originalHakenut?.hakemusOid,
  );

  const hakenut = clone(changedHakenut ?? originalHakenut);

  for (const fieldName of SIJOITTELUN_TULOS_EDITABLE_FIELDS) {
    if (event[fieldName] !== undefined) {
      (hakenut[fieldName] as string | boolean) = event[fieldName];
    }
  }

  if (changedHakenut) {
    return isUnchanged(originalHakenut, hakenut)
      ? changedHakemukset.filter((h) => h.hakemusOid !== hakenut.hakemusOid)
      : changedHakemukset.map((h) =>
          h.hakemusOid === h.hakemusOid ? hakenut : h,
        );
  } else {
    return [...changedHakemukset, hakenut];
  }
};

const updateChangedHakemus = (
  context: SijoittelunTuloksetContext,
  event: SijoittelunTulosChangeEvent,
): Array<SijoittelunHakemusValintatiedoilla> => {
  const originalHakenut = context.hakemukset.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  if (originalHakenut) {
    return assignHakemusChanges({
      changedHakemukset: context.changedHakemukset,
      originalHakenut: originalHakenut!,
      event,
    });
  }
  return context.changedHakemukset;
};

const massUpdateChangedHakemukset = (
  context: SijoittelunTuloksetContext,
  event: HakemuksetStateChangeParams,
) => {
  let changed: Array<SijoittelunHakemusValintatiedoilla> =
    context.changedHakemukset;
  let changedAmount = 0;
  event.hakemusOids.forEach((hakemusOid) => {
    const changedHakenut = changed.find((h) => h.hakemusOid === hakemusOid);
    const originalHakenut = context.hakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const hakenut = changedHakenut ?? originalHakenut;

    if (
      hakenut &&
      ((event.ilmoittautumisTila &&
        event.ilmoittautumisTila !== hakenut.ilmoittautumisTila &&
        isIlmoittautuminenPossible(hakenut)) ||
        (event.vastaanottotila &&
          event.vastaanottotila !== hakenut.vastaanottotila &&
          isVastaanottoPossible(hakenut)))
    ) {
      changedAmount++;
      changed = assignHakemusChanges({
        changedHakemukset: changed,
        originalHakenut: originalHakenut!,
        event,
      });
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
  return SIJOITTELUN_TULOS_EDITABLE_FIELDS.every((fieldName) => {
    return original[fieldName] === changed[fieldName];
  });
};

export const useIsDirtySijoittelunTulos = (
  sijoittelunTulosActorRef: SijoittelunTulosActorRef,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
