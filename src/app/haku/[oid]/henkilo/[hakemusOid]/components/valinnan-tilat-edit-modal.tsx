import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import useToaster from '@/app/hooks/useToaster';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { saveValinnanTulokset } from '@/app/lib/valinta-tulos-service';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { valinnanTuloksetQueryOptions } from '../hooks/useHenkiloPageData';
import {
  isImoittautuminenPossible,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { OphApiError } from '@/app/lib/common';
import { ValinnanTulosUpdateErrorResult } from '@/app/lib/types/valinta-tulos-types';
import { HttpClientResponse } from '@/app/lib/http-client';
import {
  EditModalDialog,
  InlineFormControl,
  PaddedLabel,
} from '@/app/components/edit-modal-dialog';
import { ValinnanTulosLisatiedoilla } from '../lib/henkilo-page-types';
import { LocalizedSelect } from '@/app/components/localized-select';

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
  lastModified,
}: {
  lastModified: string | null;
}) => {
  const { addToast } = useToaster();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  return useMutation({
    mutationFn: async (valinnanTulos: ValinnanTulosLisatiedoilla) => {
      await saveValinnanTulokset({
        lastModified,
        valintatapajonoOid: valinnanTulos.valintatapajonoOid,
        tulokset: [valinnanTulos],
      });
    },
    onError: (error) => {
      let message = t('henkilo.valinta-save-error');
      if (error instanceof OphApiError) {
        const response = error.response as HttpClientResponse<
          Array<ValinnanTulosUpdateErrorResult>
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
  hakijanNimi: string;
  valinnanTulos: ValinnanTulosLisatiedoilla;
  hakutoiveTitle: React.ReactNode;
}>(({ hakijanNimi, hakutoiveTitle, valinnanTulos }) => {
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

  const { mutate: saveValinnanTilat, isPending } = useValinnanTilatMutation({
    lastModified: valinnanTulos.lastModified,
  });

  return (
    <EditModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={t('henkilo.muokkaa-valintaa')}
      isPending={isPending}
      pendingTitle={t('henkilo.tallennetaan-valintaa')}
      onClose={onClose}
      actions={
        <ModalActions
          onClose={onClose}
          onSave={() =>
            saveValinnanTilat({
              ...valinnanTulos,
              vastaanottotila: vastaanottoTila as VastaanottoTila,
              ilmoittautumistila: ilmoittautumisTila as IlmoittautumisTila,
            })
          }
        />
      }
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
          <span aria-labelledby={labelId}>{hakutoiveTitle}</span>
        )}
      />
      {isVastaanottoPossible({
        tila: valinnanTulos.valinnantila,
        vastaanottotila: valinnanTulos.vastaanottotila,
        julkaistavissa: valinnanTulos.julkaistavissa,
      }) && (
        <InlineFormControl
          label={
            <PaddedLabel>{t('henkilo.taulukko.vastaanoton-tila')}</PaddedLabel>
          }
          renderInput={({ labelId }) => (
            <LocalizedSelect
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
              {t('henkilo.taulukko.ilmoittautumisen-tila')}
            </PaddedLabel>
          }
          renderInput={({ labelId }) => (
            <LocalizedSelect
              sx={{ width: '100%' }}
              labelId={labelId}
              value={ilmoittautumisTila}
              options={ilmoittautumisTilaOptions}
              onChange={(e) => setIlmoittautumisTila(e.target.value)}
            />
          )}
        />
      )}
    </EditModalDialog>
  );
});
