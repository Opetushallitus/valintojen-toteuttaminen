import { fromPromise } from 'xstate';
import { useActorRef } from '@xstate/react';
import { createValinnanTuloksetMachine } from '@/lib/state/createValinnanTuloksetMachine';
import useToaster from '@/hooks/useToaster';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { saveValinnanTulokset } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import {
  getHakukohteenValinnanTulokset,
  hyvaksyValintaEsitys,
  saveMaksunTilanMuutokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { ValinnanTulosErrorGlobalModal } from '@/components/modals/valinnan-tulos-error-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { useQueryClient } from '@tanstack/react-query';
import { rejectAndLog } from '@/lib/common';
import {
  refetchHakukohteenLukuvuosimaksut,
  refetchHakukohteenValinnanTulokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-queries';
import { inspect } from '@/lib/xstate-utils';

export const valinnanTuloksetMachine =
  createValinnanTuloksetMachine<HakemuksenValinnanTulos>('valinta').provide({
    actions: {
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
  const { addToast } = useToaster();

  const onUpdated = () => {
    refetchHakukohteenValinnanTulokset({
      queryClient,
      hakuOid: haku.oid,
      hakukohdeOid: hakukohde.oid,
    });
    refetchHakukohteenLukuvuosimaksut({
      queryClient,
      hakukohdeOid: hakukohde.oid,
      haku,
    });
  };

  const valinnanTulosActorRef = useActorRef(
    valinnanTuloksetMachine.provide({
      actions: {
        notify: (_, toast) => addToast(toast),
        refetchTulokset: onUpdated,
      },
      actors: {
        updateHakemukset: fromPromise(async ({ input }) => {
          await saveValinnanTulokset({
            haku,
            hakukohdeOid: hakukohde.oid,
            hakemukset: input.changed,
          });
          await saveMaksunTilanMuutokset(
            hakukohde.oid,
            input.changed,
            input.original,
          );
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
          await saveValinnanTulokset({
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
    {
      inspect,
      input: {
        hakukohdeOid: hakukohde.oid,
        valintatapajonoOid: getValintatapajonoOidFromHakemukset(hakemukset),
        hakemukset,
        lastModified,
      },
    },
  );

  return valinnanTulosActorRef;
};
