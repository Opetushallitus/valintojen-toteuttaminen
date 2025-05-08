import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Stack } from '@mui/material';
import { OphButton, OphCheckbox } from '@opetushallitus/oph-design-system';
import useToaster from '@/hooks/useToaster';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { saveValinnanTulokset } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { getHakemuksenValinnanTuloksetQueryOptions } from '../hooks/useHenkiloPageData';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
  isVastaanottotilaJulkaistavissa,
} from '@/lib/sijoittelun-tulokset-utils';
import { OphApiError } from '@/lib/common';
import { ValinnanTulosUpdateErrorResult } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { HttpClientResponse } from '@/lib/http-client';
import {
  EditModal,
  InlineFormControl,
  PaddedLabel,
} from '@/components/modals/edit-modal';
import { ValinnanTulosLisatiedoilla } from '../lib/henkilo-page-types';
import { LocalizedSelect } from '@/components/localized-select';
import { Haku } from '@/lib/kouta/kouta-types';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';
import { useIsValintaesitysJulkaistavissa } from '@/hooks/useIsValintaesitysJulkaistavissa';

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
  const valintaQueryOptions = getHakemuksenValinnanTuloksetQueryOptions({
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
  haku: Haku;
  hakijanNimi: string;
  valinnanTulos: ValinnanTulosLisatiedoilla;
  hakutoiveTitle: React.ReactNode;
}>(({ haku, hakijanNimi, hakutoiveTitle, valinnanTulos }) => {
  const { open, slotProps, onClose } = useOphModalProps();
  const { t } = useTranslations();

  const [julkaistavissa, setJulkaistavissa] = useState<boolean>(
    Boolean(valinnanTulos.julkaistavissa),
  );

  const [vastaanottoTila, setVastaanottoTila] = useState<string>(
    () => valinnanTulos.vastaanottotila ?? '',
  );

  const [ilmoittautumisTila, setIlmoittautumisTila] = useState<string>(
    () => valinnanTulos.ilmoittautumistila ?? '',
  );

  const vastaanottoTilaOptions = useVastaanottoTilaOptions();

  const ilmoittautumisTilaOptions = useIlmoittautumisTilaOptions();

  const isValintaesitysJulkaistavissa = useIsValintaesitysJulkaistavissa({
    haku,
  });

  const ilmoittautuminenPossible = isIlmoittautuminenPossible({
    tila: valinnanTulos.valinnantila,
    vastaanottotila: vastaanottoTila as VastaanottoTila,
    julkaistavissa,
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
    <EditModal
      open={open}
      slotProps={slotProps}
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
              julkaistavissa,
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
      <InlineFormControl
        label={t('henkilo.taulukko.julkaistavissa')}
        renderInput={({ labelId }) => (
          <OphCheckbox
            inputProps={{ 'aria-labelledby': labelId }}
            checked={julkaistavissa}
            disabled={
              isPending ||
              !isValintaesitysJulkaistavissa ||
              !isVastaanottotilaJulkaistavissa({
                vastaanottotila: vastaanottoTila as VastaanottoTila,
              })
            }
            onChange={(e) => setJulkaistavissa(e.target.checked)}
          />
        )}
      />
      {isVastaanottoPossible({
        tila: valinnanTulos.valinnantila,
        vastaanottotila: valinnanTulos.vastaanottotila,
        julkaistavissa,
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
    </EditModal>
  );
});
