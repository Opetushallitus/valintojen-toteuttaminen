import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  OphButton,
  OphInput,
  OphSelect,
} from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { LaskettuJono } from '@/app/hooks/useLasketutValinnanVaiheet';
import {
  Jarjestyskriteeri,
  TuloksenTila,
} from '@/app/lib/types/laskenta-types';
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
import { isEmpty } from 'remeda';
import { InlineFormControl, PaddedLabel } from './inline-form-control';
import { EditModalDialog } from './edit-modal-dialog';

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

  const tuloksenTilaOptions = Object.values(TuloksenTila).map((v) => ({
    value: v,
    label: t('tuloksenTila.' + v),
  }));

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

type JarjestyskriteeriParams = {
  tila: string;
  arvo: string;
  selite: string;
};

const useMuokkausParams = (jarjestyskriteeri: Jarjestyskriteeri) => {
  const [muokkausParams, setMuokkausParams] = useState<JarjestyskriteeriParams>(
    () => ({
      tila: jarjestyskriteeri.tila,
      arvo: jarjestyskriteeri.arvo?.toString() ?? '',
      selite: jarjestyskriteeri.kuvaus?.FI ?? '',
    }),
  );

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
}: {
  hakuOid: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeriPrioriteetti: number;
}) => {
  const { addToast } = useToaster();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mode,
      ...params
    }: JarjestyskriteeriParams & { mode: 'save' | 'delete' }) => {
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
    onError: (e, { mode }) => {
      addToast({
        key: `valintalaskenta-${mode}-error`,
        message: `henkilo.valintalaskenta-${mode}-error`,
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: (_, { mode }) => {
      addToast({
        key: `valintalaskenta-${mode}-success`,
        message: `henkilo.valintalaskenta-${mode}-success`,
        type: 'success',
      });
      refetchValinnanvaiheet({ hakuOid, hakemusOid, queryClient });
      hideModal(ValintalaskentaEditModal);
    },
  });
};

export const ValintalaskentaEditModal = createModal<{
  hakijanNimi: string;
  hakukohde: Hakukohde;
  valintatapajono: LaskettuJono;
  hakutoiveNumero: number;
}>(({ hakutoiveNumero, hakijanNimi, hakukohde, valintatapajono }) => {
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

  const { mutate: mutateJarjestyskriteeri, isPending: isPending } =
    useJarjestyskriteeriMutation({
      hakemusOid: jonosija.hakemusOid,
      valintatapajonoOid: valintatapajono.oid,
      jarjestyskriteeriPrioriteetti,
      hakuOid: hakukohde.hakuOid,
    });

  return (
    <EditModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={t('henkilo.muokkaa-valintalaskentaa')}
      pendingTitle={t('henkilo.tallennetaan-valintalaskentaa')}
      isPending={isPending}
      onClose={onClose}
      actions={
        <ModalActions
          onClose={onClose}
          onSave={() =>
            mutateJarjestyskriteeri({ ...muokkausParams, mode: 'save' })
          }
          onDelete={() =>
            mutateJarjestyskriteeri({ ...muokkausParams, mode: 'delete' })
          }
          deleteDisabled={isEmpty(jarjestyskriteeri?.kuvaus ?? {})}
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
        onChange={(changedParams) =>
          setMuokkausParams((oldParams) => ({
            ...oldParams,
            ...changedParams,
          }))
        }
      />
    </EditModalDialog>
  );
});
