import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  OphButton,
  OphFormFieldWrapper,
  OphInput,
} from '@opetushallitus/oph-design-system';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import {
  LaskennanJonosijaTulos,
  LaskennanValintatapajonoTulos,
} from '@/hooks/useEditableValintalaskennanTulokset';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { HakutoiveTitle } from '../hakutoive-title';
import { EditModal, InlineFormControl, PaddedLabel } from './edit-modal';
import { LocalizedSelect } from '@/components/localized-select';
import { useMuokkausParams } from '@/hooks/useJarjestyskriteeriMuokkausParams';
import { JarjestyskriteeriParams } from '@/lib/types/jarjestyskriteeri-types';
import { useTuloksenTilaOptions } from '@/hooks/useTuloksenTilaOptions';
import { useMuokattuJonosijaActorRef } from '@/lib/state/muokattu-jonosija-state';
import { useHasChanged } from '@/hooks/useHasChanged';

const ModalActions = ({
  onClose,
  onSave,
  onDelete,
  deleteDisabled,
  amountToSave,
}: {
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  amountToSave: number;
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
        {t('valintalaskenta.muokkaus.poista-muokkaus')}
      </OphButton>
      <OphButton variant="contained" onClick={onSave}>
        {t('yleinen.tallenna')}
        {amountToSave > 0 &&
          t('valintalaskenta.muokkaus.tallenna-n-kriteeria', {
            maara: amountToSave,
          })}
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
        label={
          <PaddedLabel>{t('valintalaskenta.muokkaus.pisteet')}</PaddedLabel>
        }
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
            {t('valintalaskenta.muokkaus.laskennan-tuloksen-tila')}
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
          <PaddedLabel>
            {t('valintalaskenta.muokkaus.muokkauksen-syy')}
          </PaddedLabel>
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

export const ValintalaskentaEditGlobalModal = createModal<{
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

    const [jarjestyskriteeriPrioriteetti, setJarjestyskriteeriPrioriteetti] =
      useState<number>(0);

    const jarjestyskriteeriOptions =
      jonosija.jarjestyskriteerit?.map(({ nimi, prioriteetti }) => ({
        value: prioriteetti.toString(),
        label: `${prioriteetti + 1}. ${nimi}`,
      })) ?? [];

    const jonosijaChanged = useHasChanged(jonosija.hakemusOid);

    const successCallback = useCallback(() => {
      if (jonosijaChanged) {
        hideModal(ValintalaskentaEditGlobalModal);
        onSuccess();
      }
    }, [jonosijaChanged, onSuccess]);

    const {
      snapshot,
      deleteKriteeri,
      isPending,
      saveKriteerit,
      onJarjestysKriteeriChange,
    } = useMuokattuJonosijaActorRef({
      valintatapajonoOid: valintatapajono.valintatapajonooid,
      jonosija,
      onSuccess: successCallback,
    });

    const jarjestyskriteeri =
      snapshot.context.changedKriteerit.find(
        (k) => k.prioriteetti === jarjestyskriteeriPrioriteetti,
      ) ?? jonosija.jarjestyskriteerit?.[jarjestyskriteeriPrioriteetti];

    const [muokkausParams, setMuokkausParams] =
      useMuokkausParams(jarjestyskriteeri);

    return (
      <EditModal
        open={open}
        slotProps={slotProps}
        title={t('valintalaskenta.muokkaus.muokkaa-valintalaskentaa')}
        pendingTitle={t(
          'valintalaskenta.muokkaus.tallennetaan-valintalaskentaa',
        )}
        isPending={isPending}
        onClose={onClose}
        actions={
          <ModalActions
            onClose={onClose}
            onSave={saveKriteerit}
            onDelete={() => deleteKriteeri(jarjestyskriteeriPrioriteetti)}
            // Jonosijan tuloksen muokkauksen voi poistaa vain jos sellainen on tallennettu
            deleteDisabled={!jonosija.muokattu}
            amountToSave={snapshot.context.changedKriteerit?.length ?? 0}
          />
        }
      >
        <InlineFormControl
          label={t('valintalaskenta.muokkaus.hakija')}
          renderInput={({ labelId }) => (
            <span aria-labelledby={labelId}>{hakijanNimi}</span>
          )}
        />
        <InlineFormControl
          label={t('valintalaskenta.muokkaus.hakutoive')}
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
          label={t('valintalaskenta.muokkaus.valintatapajono')}
          renderInput={({ labelId }) => (
            <span aria-labelledby={labelId}>{valintatapajono.nimi}</span>
          )}
        />
        <Box sx={{ gridColumnStart: 'span 2' }}>
          <Divider sx={{ marginBottom: (theme) => theme.spacing(2) }} />
          <OphFormFieldWrapper
            label={t('valintalaskenta.muokkaus.jarjestyskriteeri')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: (theme) => theme.spacing(0.5),
            }}
            renderInput={({ labelId }) => (
              <Box sx={{ boxSizing: 'border-box' }}>
                <Typography>
                  {t('valintalaskenta.muokkaus.jarjestyskriteeri-kuvaus')}
                </Typography>
                <LocalizedSelect
                  sx={{
                    display: 'block',
                    marginTop: (theme) => theme.spacing(0.5),
                  }}
                  labelId={labelId}
                  value={jarjestyskriteeriPrioriteetti.toString()}
                  options={jarjestyskriteeriOptions}
                  onChange={(e) =>
                    setJarjestyskriteeriPrioriteetti(Number(e.target.value))
                  }
                />
              </Box>
            )}
          />
        </Box>
        <JarjestyskriteeriFields
          value={muokkausParams}
          onChange={(changedParams) => {
            onJarjestysKriteeriChange({ ...muokkausParams, ...changedParams });
            setMuokkausParams((oldParams) => ({
              ...oldParams,
              ...changedParams,
            }));
          }}
        />
      </EditModal>
    );
  },
);
