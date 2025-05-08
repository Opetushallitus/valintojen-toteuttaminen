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
import {
  HakemusValinnanTuloksilla,
  ValinnanTulosFields,
} from '@/lib/valinta-tulos-service/valinta-tulos-types';

export const valinnanTuloksetMachine =
  createValinnanTulosMachine<ValinnanTulosFields>().provide({
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
          const someTulosUpdated = context.changedTulokset.some(
            (h) => !erroredHakemusOids.includes(h.hakemusOid),
          );
          if (someTulosUpdated) {
            context.onUpdated?.();
          }
        }
      },
      errorModal: () => {},
    },
    actors: {
      updateHakemukset: fromPromise(async () => {
        return Promise.reject();
      }),
      publish: fromPromise(() => Promise.reject()),
    },
  });

type SijoittelunTulosStateParams = {
  hakukohdeOid: string;
  hakemukset: Array<HakemusValinnanTuloksilla>;
  lastModified: string;
  onUpdated?: () => void;
};

export const useValinnanTulosActorRef = ({
  hakukohdeOid,
  hakemukset,
  lastModified,
  onUpdated,
}: SijoittelunTulosStateParams) => {
  const valinnanTulosActorRef = useActorRef(valinnanTuloksetMachine);
  const { addToast } = useToaster();

  useEffect(() => {
    valinnanTulosActorRef.send({
      type: ValinnanTulosEventType.RESET,
      params: {
        hakukohdeOid,
        hakemukset,
        tulokset: hakemukset?.reduce(
          (result, hakemus) =>
            hakemus.valinnanTulos ? [...result, hakemus.valinnanTulos] : result,
          [] as Array<ValinnanTulosFields>,
        ),
        lastModified,
        onUpdated,
        addToast,
      },
    });
  }, [
    valinnanTulosActorRef,
    hakemukset,
    hakukohdeOid,
    lastModified,
    onUpdated,
    addToast,
  ]);

  return valinnanTulosActorRef;
};
