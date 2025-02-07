import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton, OphInput } from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';
import { useState } from 'react';
import {
  LaskennanJonosijaTulos,
  LaskennanValintatapajonoTulos,
} from '@/app/hooks/useEditableValintalaskennanTulokset';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakutoiveTitle } from './hakutoive-title';
import {
  EditModalDialog,
  InlineFormControl,
  PaddedLabel,
} from './edit-modal-dialog';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useJarjestyskriteeriState } from '@/app/hooks/useJarjestyskriteeriState';
import { JarjestyskriteeriParams } from '@/app/lib/types/jarjestyskriteeri-types';
import useToaster from '@/app/hooks/useToaster';
import { useTuloksenTilaOptions } from '@/app/hooks/useTuloksenTilaOptions';

const ModalActions = ({
  onClose,
  onSave,
  onDelete,
  deleteDisabled,
}: {
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
}) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" spacing={2}>
      <OphButton variant="outlined" onClick={onClose}>
        {t('yleinen.peruuta')}
      </OphButton>
      <OphButton
        variant="contained"
        onClick={onDelete}
        disabled={deleteDisabled}
      >
        {t('henkilo.poista-muokkaus')}
      </OphButton>
      <OphButton variant="contained" onClick={onSave}>
        {t('yleinen.tallenna')}
      </OphButton>
    </Stack>
  );
};

const JarjestyskriteeriFields = ({
  value,
  onChange,
}: {
  value: JarjestyskriteeriParams;
  onChange: (e: Partial<JarjestyskriteeriParams>) => void;
}) => {
  const { t } = useTranslations();

  const tuloksenTilaOptions = useTuloksenTilaOptions({
    harkinnanvarainen: false,
  });

  return (
    <>
      <InlineFormControl
        label={<PaddedLabel>{t('henkilo.taulukko.pisteet')}</PaddedLabel>}
        renderInput={({ labelId }) => (
          <OphInput
            value={value.arvo}
            inputProps={{ 'aria-labelledby': labelId }}
            onChange={(e) => onChange({ arvo: e.target.value })}
          />
        )}
      />
      <InlineFormControl
        label={
          <PaddedLabel>
            {t('henkilo.taulukko.laskennan-tuloksen-tila')}
          </PaddedLabel>
        }
        renderInput={({ labelId }) => (
          <LocalizedSelect
            sx={{ width: '100%' }}
            labelId={labelId}
            value={value.tila}
            options={tuloksenTilaOptions}
            onChange={(e) => onChange({ tila: e.target.value })}
          />
        )}
      />
      <InlineFormControl
        label={
          <PaddedLabel>{t('henkilo.taulukko.muokkauksen-syy')}</PaddedLabel>
        }
        renderInput={({ labelId }) => (
          <OphInput
            multiline={true}
            maxRows={10}
            sx={{ width: '100%', height: 'auto', minHeight: '48px' }}
            inputProps={{ 'aria-labelledby': labelId }}
            value={value.selite}
            onChange={(e) => onChange({ selite: e.target.value })}
            notched={false}
          />
        )}
      />
    </>
  );
};

export const ValintalaskentaEditModal = createModal<{
  hakijanNimi: string;
  hakukohde: Hakukohde;
  valintatapajono: LaskennanValintatapajonoTulos;
  hakutoiveNumero: number;
  jonosija: LaskennanJonosijaTulos;
  onSuccess: () => void;
}>(
  ({
    hakutoiveNumero,
    hakijanNimi,
    hakukohde,
    valintatapajono,
    jonosija,
    onSuccess,
  }) => {
    const { open, slotProps, onClose } = useOphModalProps();
    const { t } = useTranslations();

    const { addToast } = useToaster();

    const [jarjestyskriteeriPrioriteetti, setJarjestyskriteeriPrioriteetti] =
      useState<number>(0);

    const jarjestyskriteeri =
      jonosija.jarjestyskriteerit?.[jarjestyskriteeriPrioriteetti];

    const jarjestyskriteeriOptions =
      jonosija.jarjestyskriteerit?.map(({ nimi, prioriteetti }) => ({
        value: prioriteetti.toString(),
        label: `${prioriteetti + 1}. ${nimi}`,
      })) ?? [];

    const {
      isPending,
      muokkausParams,
      setMuokkausParams,
      saveJarjestyskriteeri,
      deleteJarjestyskriteeri,
    } = useJarjestyskriteeriState({
      hakemusOid: jonosija.hakemusOid,
      valintatapajonoOid: valintatapajono.valintatapajonooid,
      jarjestyskriteeri,
      onError: (e, mode) => {
        addToast({
          key: `valintalaskenta-${mode}-error`,
          message: `henkilo.valintalaskenta-${mode}-error`,
          type: 'error',
        });
        console.error(e);
      },
      onSuccess: (mode) => {
        addToast({
          key: `valintalaskenta-${mode}-success`,
          message: `henkilo.valintalaskenta-${mode}-success`,
          type: 'success',
        });
        onSuccess();
        hideModal(ValintalaskentaEditModal);
      },
    });

    return (
      <EditModalDialog
        open={open}
        slotProps={slotProps}
        title={t('henkilo.muokkaa-valintalaskentaa')}
        pendingTitle={t('henkilo.tallennetaan-valintalaskentaa')}
        isPending={isPending}
        onClose={onClose}
        actions={
          <ModalActions
            onClose={onClose}
            onSave={() => saveJarjestyskriteeri()}
            onDelete={() => deleteJarjestyskriteeri()}
            // Jonosijan tuloksen muokkauksen voi poistaa vain jos sellainen on tallennettu
            deleteDisabled={!jonosija.muokattu}
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
            <span aria-labelledby={labelId}>
              <HakutoiveTitle
                hakutoiveNumero={hakutoiveNumero}
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
            <PaddedLabel>{t('henkilo.taulukko.jarjestyskriteeri')}</PaddedLabel>
          }
          renderInput={({ labelId }) => (
            <LocalizedSelect
              sx={{ width: '100%' }}
              labelId={labelId}
              value={jarjestyskriteeriPrioriteetti.toString()}
              options={jarjestyskriteeriOptions}
              onChange={(e) =>
                setJarjestyskriteeriPrioriteetti(Number(e.target.value))
              }
            />
          )}
        />
        <JarjestyskriteeriFields
          value={muokkausParams}
          onChange={(changedParams) =>
            setMuokkausParams((oldParams) => ({
              ...oldParams,
              ...changedParams,
            }))
          }
        />
      </EditModalDialog>
    );
  },
);
