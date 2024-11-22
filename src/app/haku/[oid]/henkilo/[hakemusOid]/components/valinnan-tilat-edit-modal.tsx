import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { Box, Stack } from '@mui/material';
import { OphButton, OphSelect } from '@opetushallitus/oph-design-system';
import { InlineFormControl, PaddedLabel } from './inline-form-control';
import { HakutoiveTitle } from './hakutoive-title';
import useToaster from '@/app/hooks/useToaster';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import {
  saveValinnanTulokset,
  ValinnanTulos,
} from '@/app/lib/valinta-tulos-service';
import {
  IlmoittautumisTila,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { valinnanTuloksetQueryOptions } from '../hooks/useHenkiloPageData';
import {
  isIlmoittautumistilaEditable,
  isVastaanottotilaEditable,
} from '@/app/lib/sijoittelun-tulokset-utils';

const ModalActions = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" spacing={2}>
      <OphButton variant="outlined" onClick={onClose}>
        {t('yleinen.peruuta')}
      </OphButton>
      <OphButton variant="contained" onClick={onSave}>
        {t('yleinen.tallenna')}
      </OphButton>
    </Stack>
  );
};

type MuokkausParams = {
  vastaanottotieto: VastaanottoTila;
  valinnantila: SijoittelunTila;
  ilmoittautumistila: IlmoittautumisTila;
  julkaistavissa: boolean;
};

const refetchValinnanTulokset = ({
  queryClient,
  hakemusOid,
}: {
  queryClient: QueryClient;
  hakemusOid: string;
}) => {
  const valintaQueryOptions = valinnanTuloksetQueryOptions({
    hakemusOid,
  });
  queryClient.resetQueries(valintaQueryOptions);
  queryClient.invalidateQueries(valintaQueryOptions);
};

const useValinnanTilatMutation = ({
  hakukohdeOid,
  hakemusOid,
  henkiloOid,
  valintatapajonoOid,
  dateHeader,
}: {
  hakukohdeOid: string;
  hakemusOid: string;
  henkiloOid: string;
  valintatapajonoOid: string;
  dateHeader: string | null;
}) => {
  const { addToast } = useToaster();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: MuokkausParams) => {
      await saveValinnanTulokset({
        valintatapajonoOid,
        ifUnmodifiedSince: (dateHeader
          ? new Date(dateHeader)
          : new Date()
        ).toUTCString(),
        tulokset: [
          {
            hakukohdeOid,
            valintatapajonoOid,
            henkiloOid,
            hakemusOid,
            valinnantila: params.valinnantila,
            vastaanottotila: params.vastaanottotieto,
            ilmoittautumistila: params.ilmoittautumistila,
            julkaistavissa: params.julkaistavissa,
          },
        ],
      });
    },
    onError: (e) => {
      addToast({
        key: `vastaanottotieto-edit-error`,
        message: `henkilo.vastaanottieto-edit-error`,
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: () => {
      addToast({
        key: `vastaanottotieto-edit-success`,
        message: `henkilo.vastaanottotieto-edit-success`,
        type: 'success',
      });

      refetchValinnanTulokset({ hakemusOid, queryClient });
      hideModal(ValinnanTilatEditModal);
    },
  });
};

export const ValinnanTilatEditModal = createModal<{
  hakutoiveNumero: number;
  hakijanNimi: string;
  hakukohde: Hakukohde;
  valinnanTulos: ValinnanTulos;
  henkiloOid: string;
  dateHeader: string | null;
}>(
  ({
    hakutoiveNumero,
    hakijanNimi,
    hakukohde,
    valinnanTulos,
    henkiloOid,
    dateHeader,
  }) => {
    const { open, TransitionProps, onClose } = useOphModalProps();
    const { t } = useTranslations();

    const [vastaanottoTila, setVastaanottoTila] = useState<string>(
      () => valinnanTulos.vastaanottotila ?? '',
    );

    const [ilmoittautumisTila, setIlmoittautumisTila] = useState<string>(
      () => valinnanTulos.ilmoittautumistila ?? '',
    );

    const vastaanottoTilaOptions = Object.values(VastaanottoTila).map(
      (tila) => ({
        value: tila as string,
        label: t(`vastaanottotila.${tila}`),
      }),
    );

    const ilmoittautumisTilaOptions = Object.values(IlmoittautumisTila).map(
      (tila) => ({
        value: tila as string,
        label: t(`ilmoittautumistila.${tila}`),
      }),
    );

    const mutation = useValinnanTilatMutation({
      hakukohdeOid: hakukohde.oid,
      hakemusOid: valinnanTulos.hakemusOid,
      valintatapajonoOid: valinnanTulos.valintatapajonoOid,
      henkiloOid,
      dateHeader,
    });

    return (
      <OphModalDialog
        open={open}
        TransitionProps={TransitionProps}
        title={t('henkilo.muokkaa-valintaa')}
        maxWidth="lg"
        titleAlign="left"
        onClose={onClose}
        actions={
          <ModalActions
            onClose={onClose}
            onSave={() =>
              mutation.mutate({
                vastaanottotieto: vastaanottoTila as VastaanottoTila,
                valinnantila: valinnanTulos.valinnantila,
                ilmoittautumistila: ilmoittautumisTila as IlmoittautumisTila,
                julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
              })
            }
          />
        }
      >
        {mutation.isPending ? (
          <FullClientSpinner />
        ) : (
          <Box
            sx={{
              display: 'grid',
              paddingY: 2,
              gridGap: (theme) => theme.spacing(2),
              gridTemplateColumns: '170px 1fr',
              placeItems: 'start stretch',
            }}
          >
            <InlineFormControl
              label={t('henkilo.taulukko.hakija')}
              renderInput={({ labelId }) => (
                <span aria-labelledby={labelId}>{hakijanNimi}</span>
              )}
            />
            <InlineFormControl
              label={t('henkilo.taulukko.hakutoive')}
              renderInput={({ labelId }) => (
                <span aria-labelledby={labelId}>
                  <HakutoiveTitle
                    hakutoiveNumero={hakutoiveNumero}
                    hakukohde={hakukohde}
                  />
                </span>
              )}
            />
            {isVastaanottotilaEditable({
              tila: valinnanTulos.valinnantila,
              vastaanottotila: valinnanTulos.vastaanottotila,
              julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
            }) && (
              <InlineFormControl
                label={
                  <PaddedLabel>
                    {t('henkilo.taulukko.vastaanottotila')}
                  </PaddedLabel>
                }
                renderInput={({ labelId }) => (
                  <OphSelect
                    sx={{ width: '100%' }}
                    labelId={labelId}
                    value={vastaanottoTila}
                    options={vastaanottoTilaOptions}
                    onChange={(e) => setVastaanottoTila(e.target.value)}
                  />
                )}
              />
            )}
            {isIlmoittautumistilaEditable({
              tila: valinnanTulos.valinnantila,
              vastaanottotila: valinnanTulos.vastaanottotila,
              julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
            }) && (
              <InlineFormControl
                label={
                  <PaddedLabel>
                    {t('henkilo.taulukko.ilmoittautumistila')}
                  </PaddedLabel>
                }
                renderInput={({ labelId }) => (
                  <OphSelect
                    sx={{ width: '100%' }}
                    labelId={labelId}
                    value={ilmoittautumisTila}
                    options={ilmoittautumisTilaOptions}
                    onChange={(e) => setIlmoittautumisTila(e.target.value)}
                  />
                )}
              />
            )}
          </Box>
        )}
      </OphModalDialog>
    );
  },
);
