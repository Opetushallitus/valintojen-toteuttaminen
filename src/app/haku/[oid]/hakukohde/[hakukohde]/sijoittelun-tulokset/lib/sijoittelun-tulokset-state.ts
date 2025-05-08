import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isNullish } from 'remeda';
import { SijoittelunTulosErrorModalDialog } from '../components/sijoittelun-tulos-error-modal';
import { showModal } from '@/components/modals/global-modal';
import { OphApiError } from '@/lib/common';
import { useEffect } from 'react';
import { useActorRef } from '@xstate/react';
import {
  createValinnanTulosMachine,
  ValinnanTulosActorRef,
  ValinnanTulosEventType,
} from '@/lib/state/valinnan-tulos-machine';
import useToaster from '@/hooks/useToaster';

export type SijoittelunTulosActorRef =
  ValinnanTulosActorRef<SijoittelunHakemusValintatiedoilla>;

export const sijoittelunTuloksetMachine =
  createValinnanTulosMachine<SijoittelunHakemusValintatiedoilla>().provide({
    actions: {
      alert: ({ context }, params) =>
        context.addToast?.({
          key: `sijoittelun-tulokset-update-failed-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),

      successNotify: ({ context }, params) => {
        context.onUpdated?.();
        context.addToast?.({
          key: `sijoittelun-tulokset-updated-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'success',
        });
      },
      notifyMassStatusChange: ({ context }) => {
        context.addToast?.({
          key: `sijoittelun-tulokset-mass-status-change-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: 'sijoittelun-tulokset.mass-status-change-done',
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
      errorModal: ({ context }, params) => {
        showModal(SijoittelunTulosErrorModalDialog, {
          error: params.error,
          hakemukset: context.hakemukset,
        });
      },
    },
    actors: {
      updateHakemukset: fromPromise(
        async ({
          input,
        }: {
          input: {
            hakukohdeOid: string;
            valintatapajonoOid: string;
            lastModified: string;
            changed: Array<SijoittelunHakemusValintatiedoilla>;
            original: Array<SijoittelunHakemusValintatiedoilla>;
          };
        }) => {
          await saveMaksunTilanMuutokset(
            input.hakukohdeOid,
            input.changed,
            input.original,
          );
          return saveSijoitteluAjonTulokset(
            input.valintatapajonoOid,
            input.hakukohdeOid,
            input.lastModified,
            input.changed,
          );
        },
      ),
      publish: fromPromise(
        ({ input }: { input: { valintatapajonoOid: string } }) =>
          hyvaksyValintaEsitys(input.valintatapajonoOid),
      ),
    },
  });

type SijoittelunTulosStateParams = {
  hakukohdeOid: string;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  valintatapajonoOid: string;
  lastModified: string;
  onUpdated?: () => void;
};

export const useSijoittelunTulosActorRef = ({
  hakukohdeOid,
  hakemukset,
  valintatapajonoOid,
  lastModified,
  onUpdated,
}: SijoittelunTulosStateParams) => {
  const sijoittelunTuloksetActorRef = useActorRef(sijoittelunTuloksetMachine);
  const { addToast } = useToaster();

  useEffect(() => {
    sijoittelunTuloksetActorRef.send({
      type: ValinnanTulosEventType.RESET,
      params: {
        hakukohdeOid,
        valintatapajonoOid,
        hakemukset,
        tulokset: hakemukset,
        lastModified,
        onUpdated,
        addToast,
      },
    });
  }, [
    sijoittelunTuloksetActorRef,
    hakemukset,
    hakukohdeOid,
    lastModified,
    valintatapajonoOid,
    onUpdated,
    addToast,
  ]);

  return sijoittelunTuloksetActorRef;
};
