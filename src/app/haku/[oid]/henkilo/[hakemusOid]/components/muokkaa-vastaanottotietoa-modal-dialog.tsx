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
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  saveValinnanTulokset,
  SijoitteluajonTulosHakutoive,
} from '@/app/lib/valinta-tulos-service';
import { LaskettuJono } from '@/app/hooks/useLasketutValinnanVaiheet';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { FullClientSpinner } from '@/app/components/client-spinner';

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
  valinnantila: string;
  ilmoittautumistila: IlmoittautumisTila;
};

const useVastaanottotietoMutation = ({
  hakukohdeOid,
  hakemusOid,
  henkiloOid,
  valintatapajonoOid,
}: {
  hakukohdeOid: string;
  hakemusOid: string;
  henkiloOid: string;
  valintatapajonoOid: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async (params: MuokkausParams) => {
      await saveValinnanTulokset({
        valintatapajonoOid,
        lastModified: new Date().toUTCString(),
        tulokset: [
          {
            hakukohdeOid,
            valintatapajonoOid,
            henkiloOid,
            hakemusOid,
            valinnantila: params.valinnantila,
            vastaanottotila: params.vastaanottotieto,
            ilmoittautumistila: params.ilmoittautumistila,
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
      hideModal(MuokkaaVastaanottotietoaModalDialog);
    },
  });
};

export const MuokkaaVastaanottotietoaModalDialog = createModal<{
  hakijanNimi: string;
  hakukohde: Hakukohde;
  sijoittelunTulokset: SijoitteluajonTulosHakutoive;
  valintatapajono: LaskettuJono;
  hakuOid: string;
  hakemusOid: string;
  henkiloOid: string;
}>(
  ({
    hakijanNimi,
    hakukohde,
    valintatapajono,
    sijoittelunTulokset,
    hakemusOid,
    hakuOid,
    henkiloOid,
  }) => {
    const { open, TransitionProps, onClose } = useOphModalProps();
    const { t } = useTranslations();

    const sijoitteluJono =
      sijoittelunTulokset.hakutoiveenValintatapajonot?.find(
        (jono) =>
          jono.valintatapajonoOid === valintatapajono.valintatapajonooid,
      );

    const [vastaanottotieto, setVastaanottotieto] = useState<
      string | undefined
    >(() => sijoittelunTulokset.vastaanottotieto);

    const vastaanottotietoOptions = Object.values(VastaanottoTila).map(
      (tila) => ({
        value: tila,
        label: t(`vastaanottotila.${tila}`),
      }),
    );

    const mutation = useVastaanottotietoMutation({
      hakukohdeOid: hakukohde.oid,
      hakemusOid,
      valintatapajonoOid: valintatapajono.valintatapajonooid,
      henkiloOid,
    });

    return mutation.isPending ? (
      <FullClientSpinner />
    ) : (
      <OphModalDialog
        open={open}
        TransitionProps={TransitionProps}
        title={t('henkilo.muokkaa-vastaanottotietoa')}
        maxWidth="lg"
        titleAlign="left"
        onClose={onClose}
        actions={
          <ModalActions
            onClose={onClose}
            onSave={() =>
              mutation.mutate({
                vastaanottotieto: vastaanottotieto as VastaanottoTila,
                valinnantila: sijoitteluJono?.tila as string,
                ilmoittautumistila:
                  sijoitteluJono?.ilmoittautumisTila as IlmoittautumisTila,
              })
            }
          />
        }
      >
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
                  hakutoiveNumero={1}
                  hakuOid={hakuOid}
                  hakukohde={hakukohde}
                />
              </span>
            )}
          />
          <InlineFormControl
            label={t('henkilo.taulukko.valintatapajono')}
            renderInput={({ labelId }) => (
              <span aria-labelledby={labelId}>{valintatapajono.nimi}</span>
            )}
          />
          <InlineFormControl
            label={
              <PaddedLabel>
                {t('henkilo.taulukko.vastaanottotieto')}
              </PaddedLabel>
            }
            renderInput={({ labelId }) => (
              <OphSelect
                sx={{ width: '100%' }}
                labelId={labelId}
                value={vastaanottotieto}
                options={vastaanottotietoOptions}
                onChange={(e) => setVastaanottotieto(e.target.value)}
              />
            )}
          />
        </Box>
      </OphModalDialog>
    );
  },
);
