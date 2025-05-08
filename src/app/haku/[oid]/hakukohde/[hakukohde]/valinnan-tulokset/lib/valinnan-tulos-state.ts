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
      errorModal: () => {},
    },
  });

type ValinnanTulosStateParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  hakemukset: Array<HakemuksenValinnanTulos>;
  lastModified?: string;
  onUpdated?: () => void;
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
            tarjoajaOid: hakukohde.tarjoajaOid,
            hakemukset: input.changed,
            hakutyyppi: isKorkeakouluHaku(haku)
              ? 'KORKEAKOULU'
              : 'TOISEN_ASTEEN_OPPILAITOS',
          });
        }),
        publish: fromPromise(() => Promise.reject()),
      },
    }),
  );

  const { addToast } = useToaster();

  useEffect(() => {
    valinnanTulosActorRef.send({
      type: ValinnanTulosEventType.RESET,
      params: {
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
