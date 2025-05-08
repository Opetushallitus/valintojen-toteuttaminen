import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { fromPromise } from 'xstate';
import {
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
  saveSijoitteluAjonTulokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isNullish } from 'remeda';
import { ValinnanTulosErrorGlobalModal } from '@/components/modals/valinnan-tulos-error-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { rejectAndLog, OphApiError } from '@/lib/common';
import { useEffect } from 'react';
import { useActorRef } from '@xstate/react';
import { createValinnanTuloksetMachine } from '@/lib/state/createValinnanTuloksetMachine';
import useToaster from '@/hooks/useToaster';
import { useHasChanged } from '@/hooks/useHasChanged';
import { ValinnanTulosEventType } from '@/lib/state/valinnanTuloksetMachineTypes';

export const sijoittelunTuloksetMachine =
  createValinnanTuloksetMachine<SijoittelunHakemusValintatiedoilla>(
    'sijoittelu',
  ).provide({
    actions: {
      alert: ({ context }, params) =>
        context.addToast?.({
          key: `sijoittelun-tulokset-update-failed-for-${context.hakukohdeOid}-${context.valintatapajonoOid}`,
          message: params.message,
          type: 'error',
        }),

      successNotify: ({ context }, params) => {
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
      refetchTulokset: ({ context }, params) => {
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
    actors: {
      updateHakemukset: fromPromise(
        async ({
          input: {
            valintatapajonoOid,
            hakukohdeOid,
            lastModified,
            changed,
            original,
          },
        }) => {
          if (!valintatapajonoOid || !hakukohdeOid) {
            return rejectAndLog(
              `SijoittelunTuloksetMachine.updateHakemukset: Missing required parameters valintatapajonoOid=${valintatapajonoOid}, hakukohdeOid=${hakukohdeOid}`,
            );
          }
          await saveMaksunTilanMuutokset(hakukohdeOid, changed, original);
          return saveSijoitteluAjonTulokset({
            valintatapajonoOid,
            hakukohdeOid,
            lastModified,
            hakemukset: changed,
          });
        },
      ),
      publish: fromPromise(async ({ input }) => {
        if (!input.valintatapajonoOid) {
          return rejectAndLog(
            'SijoittelunTuloksetMachine.publish: Missing required parameter valintatapajonoOid',
          );
        }
        await hyvaksyValintaEsitys(input.valintatapajonoOid);
      }),
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

  const hakemuksetChanged = useHasChanged(hakemukset);

  useEffect(() => {
    if (hakemuksetChanged) {
      sijoittelunTuloksetActorRef.send({
        type: ValinnanTulosEventType.RESET,
        params: {
          hakukohdeOid,
          valintatapajonoOid,
          hakemukset,
          lastModified,
          onUpdated,
          addToast,
        },
      });
    }
  }, [
    hakemuksetChanged,
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
