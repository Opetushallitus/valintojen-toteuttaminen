import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton, OphSelect } from '@opetushallitus/oph-design-system';
import { Box, Stack } from '@mui/material';
import { OphInput } from '@/app/components/form/oph-input';
import { useEffect, useState } from 'react';
import { LaskettuJono } from '@/app/hooks/useLasketutValinnanVaiheet';
import { Jarjestyskriteeri } from '@/app/lib/types/laskenta-types';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakutoiveTitle } from './hakutoive-title';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import {
  deleteJonosijanJarjestyskriteeri,
  hakemuksenLasketutValinnanvaiheetQueryOptions,
  saveJonosijanJarjestyskriteeri,
} from '@/app/lib/valintalaskenta-service';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { isEmpty } from 'remeda';
import { InlineFormControl, PaddedLabel } from './inline-form-control';

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

enum TuloksenTila {
  HYVAKSYTTAVISSA = 'HYVAKSYTTAVISSA',
  HYLATTY = 'HYLATTY',
  MAARITTELEMATON = 'MAARITTELEMATON',
}

const JarjestyskriteeriFields = ({
  value,
  onChange,
}: {
  value: MuokkausParams;
  onChange: (e: Partial<MuokkausParams>) => void;
}) => {
  const { t } = useTranslations();

  const tuloksenTilaOptions = Object.values(TuloksenTila).map((v) => ({
    value: v,
    label: t('tuloksenTila.' + v),
  }));

  return (
    <>
      <InlineFormControl
        label={<PaddedLabel>{t('henkilo.taulukko.pisteet')}</PaddedLabel>}
        renderInput={() => (
          <OphInput
            value={value.arvo}
            onChange={(e) => onChange({ arvo: e.target.value })}
          />
        )}
      />
      <InlineFormControl
        label={<PaddedLabel>{t('henkilo.taulukko.valintatieto')}</PaddedLabel>}
        renderInput={({ labelId }) => (
          <OphSelect
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

type MuokkausParams = {
  tila: string;
  arvo: string;
  selite: string;
};

const useMuokkausParams = (jarjestyskriteeri: Jarjestyskriteeri) => {
  const [muokkausParams, setMuokkausParams] = useState<MuokkausParams>(() => ({
    tila: jarjestyskriteeri.tila,
    arvo: jarjestyskriteeri.arvo?.toString() ?? '',
    selite: jarjestyskriteeri.kuvaus?.FI ?? '',
  }));

  const jarjestyskriteeriChanged = useHasChanged(
    jarjestyskriteeri.prioriteetti,
  );

  useEffect(() => {
    if (jarjestyskriteeriChanged) {
      setMuokkausParams({
        tila: jarjestyskriteeri.tila,
        arvo: jarjestyskriteeri.arvo?.toString() ?? '',
        selite: jarjestyskriteeri.kuvaus?.FI ?? '',
      });
    }
  }, [jarjestyskriteeri, jarjestyskriteeriChanged]);

  return [muokkausParams, setMuokkausParams] as const;
};

const refetchValinnanvaiheet = ({
  queryClient,
  hakuOid,
  hakemusOid,
}: {
  queryClient: QueryClient;
  hakuOid: string;
  hakemusOid: string;
}) => {
  const options = hakemuksenLasketutValinnanvaiheetQueryOptions({
    hakuOid,
    hakemusOid,
  });
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};

const useJarjestyskriteeriMutation = ({
  hakuOid,
  hakemusOid,
  valintatapajonoOid,
  jarjestyskriteeriPrioriteetti,
  mode,
}: {
  hakuOid: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeriPrioriteetti: number;
  mode: 'update' | 'delete';
}) => {
  const { addToast } = useToaster();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: MuokkausParams) => {
      if (mode === 'delete') {
        await deleteJonosijanJarjestyskriteeri({
          valintatapajonoOid,
          hakemusOid,
          jarjestyskriteeriPrioriteetti,
        });
      } else {
        await saveJonosijanJarjestyskriteeri({
          valintatapajonoOid,
          hakemusOid,
          jarjestyskriteeriPrioriteetti,
          ...params,
        });
      }
    },
    onError: (e) => {
      addToast({
        key: `${mode}-jarjestyskriteeri-error`,
        message: `henkilo.jarjestyskriteeri.${mode}-error`,
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: () => {
      addToast({
        key: `${mode}-jarjestyskriteeri-success`,
        message: `henkilo.jarjestyskriteeri.${mode}-success`,
        type: 'success',
      });
      refetchValinnanvaiheet({ hakuOid, hakemusOid, queryClient });
      hideModal(MuokkaaValintalaskentaaModalDialog);
    },
  });
};

export const MuokkaaValintalaskentaaModalDialog = createModal<{
  hakijanNimi: string;
  hakukohde: Hakukohde;
  valintatapajono: LaskettuJono;
  hakuOid: string;
}>(({ hakijanNimi, hakukohde, valintatapajono, hakuOid }) => {
  const { open, TransitionProps, onClose } = useOphModalProps();
  const { t } = useTranslations();

  const jonosija = valintatapajono.jonosijat?.[0];

  const [jarjestyskriteeriPrioriteetti, setJarjestyskriteeriPrioriteetti] =
    useState<number>(0);

  const jarjestyskriteeri =
    jonosija.jarjestyskriteerit[jarjestyskriteeriPrioriteetti];

  const [muokkausParams, setMuokkausParams] =
    useMuokkausParams(jarjestyskriteeri);

  const jarjestyskriteeriOptions = jonosija.jarjestyskriteerit.map(
    ({ nimi, prioriteetti }) => ({
      value: prioriteetti.toString(),
      label: nimi,
    }),
  );

  const { mutate: updateJarjestyskriteeri, isPending: isUpdatePending } =
    useJarjestyskriteeriMutation({
      hakemusOid: jonosija.hakemusOid,
      valintatapajonoOid: valintatapajono.oid,
      jarjestyskriteeriPrioriteetti,
      hakuOid,
      mode: 'update',
    });

  const { mutate: deleteJarjestyskriteeri, isPending: isDeletePending } =
    useJarjestyskriteeriMutation({
      hakemusOid: jonosija.hakemusOid,
      valintatapajonoOid: valintatapajono.oid,
      jarjestyskriteeriPrioriteetti,
      hakuOid,
      mode: 'delete',
    });

  return (
    <OphModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={t('henkilo.muokkaa-valintalaskentaa')}
      maxWidth="lg"
      titleAlign="left"
      onClose={onClose}
      actions={
        <ModalActions
          onClose={onClose}
          onSave={() => updateJarjestyskriteeri(muokkausParams)}
          onDelete={() => deleteJarjestyskriteeri(muokkausParams)}
          deleteDisabled={isEmpty(jarjestyskriteeri?.kuvaus ?? {})}
        />
      }
    >
      {isUpdatePending || isDeletePending ? (
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
                {t('henkilo.taulukko.jarjestyskriteeri')}
              </PaddedLabel>
            }
            renderInput={({ labelId }) => (
              <OphSelect
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
            onChange={(p) => setMuokkausParams((s) => ({ ...s, ...p }))}
          />
        </Box>
      )}
    </OphModalDialog>
  );
});
