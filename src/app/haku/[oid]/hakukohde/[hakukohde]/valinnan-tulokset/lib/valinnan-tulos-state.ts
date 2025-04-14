import { fromPromise } from 'xstate';
import { isNullish } from 'remeda';
import { OphApiError } from '@/lib/common';
import { useEffect } from 'react';
import { useActorRef } from '@xstate/react';
import {
  createValinnanTulosMachine,
  ValinnanTulosEventType,
} from '@/lib/state/valinnan-tulos-machine';
import useToaster from '@/hooks/useToaster';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { saveErillishakuValinnanTulokset } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import {
  getHakukohteenValinnanTulokset,
  hyvaksyValintaEsitys,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { inspect } from '@/lib/xstate-utils';
import { ValinnanTulosErrorGlobalModal } from '@/components/modals/valinnan-tulos-error-global-modal';
import { showModal } from '@/components/modals/global-modal';

export const valinnanTuloksetMachine =
  createValinnanTulosMachine<HakemuksenValinnanTulos>().provide({
    actions: {
      alert: ({ context }, params) =>
        context.addToast?.({
          key: `valinnan-tulokset-update-failed-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),

      successNotify: ({ context }, params) => {
        context.onUpdated?.();
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
  onUpdated,
}: ValinnanTulosStateParams) => {
  const valinnanTulosActorRef = useActorRef(
    valinnanTuloksetMachine.provide({
      actors: {
        updateHakemukset: fromPromise(async ({ input }) => {
          await saveErillishakuValinnanTulokset({
            hakuOid: hakukohde.hakuOid,
            hakukohdeOid: hakukohde.oid,
            hakemukset: input.changed,
            hakutyyppi: isKorkeakouluHaku(haku)
              ? 'KORKEAKOULU'
              : 'TOISEN_ASTEEN_OPPILAITOS',
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
            throw new Error(
              'ValinnanTulosMachine.publish: Missing valintatapajonoOid',
            );
          }
          await hyvaksyValintaEsitys(valintatapajonoOid);
        }),
      },
    }),
    {
      inspect: inspect,
    },
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
