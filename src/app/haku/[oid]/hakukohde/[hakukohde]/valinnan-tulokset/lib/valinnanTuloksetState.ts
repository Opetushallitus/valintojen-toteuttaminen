import { fromPromise } from 'xstate';
import { useCallback, useEffect } from 'react';
import { useActorRef } from '@xstate/react';
import { createValinnanTuloksetMachine } from '@/lib/state/createValinnanTuloksetMachine';
import useToaster from '@/hooks/useToaster';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { saveErillishakuValinnanTulokset } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import {
  getHakukohteenValinnanTulokset,
  hyvaksyValintaEsitys,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { ValinnanTulosErrorGlobalModal } from '@/components/modals/valinnan-tulos-error-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { useQueryClient } from '@tanstack/react-query';
import { isNullish } from 'remeda';
import { isHakemusOid, rejectAndLog, OphProcessError } from '@/lib/common';
import { ValinnanTulosEventType } from '@/lib/state/valinnanTuloksetMachineTypes';
import { refetchHakukohteenValinnanTulokset } from '@/lib/valinta-tulos-service/valinta-tulos-queries';

export const valinnanTuloksetMachine =
  createValinnanTuloksetMachine<HakemuksenValinnanTulos>('valinta').provide({
    actions: {
      alert: ({ context }, params) =>
        context.addToast?.({
          key: `valinnan-tulokset-update-failed-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),

      successNotify: ({ context }, params) => {
        context.addToast?.({
          key: `valinnan-tulokset-updated-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'success',
        });
      },
      notifyMassStatusChange: ({ context }) => {
        context.addToast?.({
          key: `valinnan-tulokset-mass-status-change-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: 'valinnan-tulokset.mass-status-change-done',
          type: 'success',
          messageParams: { amount: context.massChangeAmount ?? 0 },
        });
      },
      refetchTulokset: ({ context }, params) => {
        if (isNullish(params?.error)) {
          context.onUpdated?.();
        } else if (
          params.error instanceof OphProcessError &&
          Array.isArray(params.error?.processObject)
        ) {
          const erroredHakemusOids = params.error?.processObject?.reduce(
            (acc, error) => {
              return isHakemusOid(error.id) ? [...acc, error.id] : acc;
            },
            [] as Array<string>,
          );

          const someTulosUpdated = context.changedHakemukset.some(
            (h) => !erroredHakemusOids.includes(h.hakemusOid),
          );
          if (someTulosUpdated) {
            context.onUpdated?.();
          }
        }
      },
      errorModal: ({ context }, params) => {
        showModal(ValinnanTulosErrorGlobalModal, {
          error: params.error,
          hakemukset: context.hakemukset,
        });
      },
    },
  });

type ValinnanTulosStateParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  hakemukset: Array<HakemuksenValinnanTulos>;
  lastModified?: string;
  onUpdated?: () => void;
};

const getValintatapajonoOidFromHakemukset = (
  hakemukset: Array<{ valintatapajonoOid?: string }>,
) => {
  return hakemukset.find((h) => h.valintatapajonoOid)?.valintatapajonoOid;
};

export const useValinnanTulosActorRef = ({
  haku,
  hakukohde,
  hakemukset,
  lastModified,
}: ValinnanTulosStateParams) => {
  const queryClient = useQueryClient();

  const onUpdated = useCallback(() => {
    refetchHakukohteenValinnanTulokset({
      queryClient,
      hakuOid: haku.oid,
      hakukohdeOid: hakukohde.oid,
    });
  }, [queryClient, hakukohde.oid, haku.oid]);

  const valinnanTulosActorRef = useActorRef(
    valinnanTuloksetMachine.provide({
      actors: {
        updateHakemukset: fromPromise(async ({ input }) => {
          await saveErillishakuValinnanTulokset({
            haku,
            hakukohdeOid: hakukohde.oid,
            hakemukset: input.changed,
          });
        }),
        publish: fromPromise(async ({ input }) => {
          let valintatapajonoOid = input.valintatapajonoOid;
          if (!valintatapajonoOid) {
            /*
              Jos valintatapajonoOid ei ole määritelty, se tarkoittaa, että
              aiemmin noudettu valinnan tulokset oli tyhjä, eli tuloksia ei ollut tallennettu.
              Ensimmäiset tulokset ollaan siis juuri tallennettu edellisessä UPDATE-vaiheessa.
              Jotta saadaan valintatapajonoOid tallennetuista tuloksista, täytyy hakea
              valinnan tulokset uudestaan.
             */
            const { data: valinnanTulos } =
              await getHakukohteenValinnanTulokset({
                hakuOid: haku.oid,
                hakukohdeOid: hakukohde.oid,
              });
            valintatapajonoOid = getValintatapajonoOidFromHakemukset(
              Object.values(valinnanTulos),
            );
          }
          if (!valintatapajonoOid) {
            return rejectAndLog(
              'ValinnanTulosMachine.publish: Missing valintatapajonoOid',
            );
          }
          await hyvaksyValintaEsitys(valintatapajonoOid);
        }),
        remove: fromPromise(async ({ input }) => {
          if (!input.hakemus) {
            return rejectAndLog(
              'ValinnanTulosMachine.remove: Could not find hakemus',
            );
          }
          await saveErillishakuValinnanTulokset({
            haku,
            hakukohdeOid: hakukohde.oid,
            hakemukset: [
              {
                ...input.hakemus,
                poistetaankoRivi: true,
              },
            ],
          });
        }),
      },
    }),
  );

  const { addToast } = useToaster();

  useEffect(() => {
    valinnanTulosActorRef.send({
      type: ValinnanTulosEventType.RESET,
      params: {
        valintatapajonoOid: getValintatapajonoOidFromHakemukset(hakemukset),
        hakukohdeOid: hakukohde.oid,
        hakemukset,
        lastModified,
        onUpdated,
        addToast,
      },
    });
  }, [
    valinnanTulosActorRef,
    hakemukset,
    hakukohde.oid,
    lastModified,
    onUpdated,
    addToast,
  ]);

  return valinnanTulosActorRef;
};
