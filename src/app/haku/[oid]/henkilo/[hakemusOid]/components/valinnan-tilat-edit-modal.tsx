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
import { useEffect, useState } from 'react';
import {
  saveValinnanTulokset,
  ValinnanTulos,
} from '@/app/lib/valinta-tulos-service';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { valinnanTuloksetQueryOptions } from '../hooks/useHenkiloPageData';
import {
  isImoittautuminenPossible,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { OphApiError } from '@/app/lib/common';
import { ValintaStatusUpdateErrorResult } from '@/app/lib/types/valinta-tulos-types';
import { HttpClientResponse } from '@/app/lib/http-client';

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
  dateHeader,
}: {
  dateHeader: string | null;
}) => {
  const { addToast } = useToaster();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  return useMutation({
    mutationFn: async (valinnanTulos: ValinnanTulos) => {
      await saveValinnanTulokset({
        valintatapajonoOid: valinnanTulos.valintatapajonoOid,
        ifUnmodifiedSince: (dateHeader
          ? new Date(dateHeader)
          : new Date()
        ).toUTCString(),
        tulokset: [valinnanTulos],
      });
    },
    onError: (error) => {
      let message = t('henkilo.valinta-save-error');
      if (error instanceof OphApiError) {
        const response = error.response as HttpClientResponse<
          Array<ValintaStatusUpdateErrorResult>
        >;

        const errors = response.data?.map((res) => res.message);
        message += '\n' + errors.join('\n');
      }

      addToast({
        key: `valinta-save-error`,
        message: message,
        type: 'error',
      });

      console.error(error);
    },
    onSuccess: (_, valinnanTulos) => {
      addToast({
        key: `valinta-save-success`,
        message: `henkilo.valinta-save-success`,
        type: 'success',
      });

      refetchValinnanTulokset({
        hakemusOid: valinnanTulos.hakemusOid,
        queryClient,
      });
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
}>(({ hakutoiveNumero, hakijanNimi, hakukohde, valinnanTulos, dateHeader }) => {
  const { open, TransitionProps, onClose } = useOphModalProps();
  const { t } = useTranslations();

  const [vastaanottoTila, setVastaanottoTila] = useState<string>(
    () => valinnanTulos.vastaanottotila ?? '',
  );

  const [ilmoittautumisTila, setIlmoittautumisTila] = useState<string>(
    () => valinnanTulos.ilmoittautumistila ?? '',
  );

  const vastaanottoTilaOptions = Object.values(VastaanottoTila).map((tila) => ({
    value: tila as string,
    label: t(`vastaanottotila.${tila}`),
  }));

  const ilmoittautumisTilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => ({
      value: tila as string,
      label: t(`ilmoittautumistila.${tila}`),
    }),
  );

  const ilmoittautuminenPossible = isImoittautuminenPossible({
    tila: valinnanTulos.valinnantila,
    vastaanottotila: vastaanottoTila as VastaanottoTila,
    julkaistavissa: valinnanTulos.julkaistavissa,
  });

  useEffect(() => {
    if (!ilmoittautuminenPossible) {
      setIlmoittautumisTila(IlmoittautumisTila.EI_TEHTY);
    }
  }, [ilmoittautuminenPossible]);

  const mutation = useValinnanTilatMutation({
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
              ...valinnanTulos,
              vastaanottotila: vastaanottoTila as VastaanottoTila,
              ilmoittautumistila: ilmoittautumisTila as IlmoittautumisTila,
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
          {isVastaanottoPossible({
            tila: valinnanTulos.valinnantila,
            vastaanottotila: valinnanTulos.vastaanottotila,
            julkaistavissa: valinnanTulos.julkaistavissa,
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
          {ilmoittautuminenPossible && (
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
});
