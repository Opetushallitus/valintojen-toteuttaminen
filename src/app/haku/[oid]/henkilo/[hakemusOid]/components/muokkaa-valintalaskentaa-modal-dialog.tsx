import {
  createModal,
  hideModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton, OphSelect } from '@opetushallitus/oph-design-system';
import { FormLabel, Grid2, Stack } from '@mui/material';
import { OphInput } from '@/app/components/form/oph-input';
import { useEffect, useId, useState } from 'react';
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
  hakemuksenLasketutValinnanvaiheetQueryOptions,
  saveJonosijanJarjestyskriteeri,
} from '@/app/lib/valintalaskenta-service';
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
      <OphButton variant="contained" disabled={true}>
        {t('henkilo.poista-muokkaus')}
      </OphButton>
      <OphButton variant="contained" onClick={onSave}>
        {t('yleinen.tallenna')}
      </OphButton>
    </Stack>
  );
};

export const InlineFormControl = ({
  label,
  renderInput,
}: {
  label: string;
  renderInput: (props: { labelId: string }) => React.ReactNode;
}) => {
  const id = useId();
  const labelId = `InlineFormControl-${id}-label`;
  return (
    <>
      <Grid2 size={2} sx={{ marginTop: '12px' }}>
        <FormLabel id={labelId}>{label}</FormLabel>
      </Grid2>
      <Grid2
        size={10}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '48px',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {renderInput({ labelId })}
      </Grid2>
    </>
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
        label={t('henkilo.taulukko.pisteet')}
        renderInput={() => (
          <OphInput
            value={value.arvo}
            onChange={(e) => onChange({ arvo: e.target.value })}
          />
        )}
      />
      <InlineFormControl
        label={t('henkilo.taulukko.valintatieto')}
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
        label={t('henkilo.taulukko.muokkauksen-syy')}
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
}: {
  hakuOid: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeriPrioriteetti: number;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tila, arvo, selite }: MuokkausParams) => {
      await saveJonosijanJarjestyskriteeri({
        valintatapajonoOid,
        hakemusOid,
        jarjestyskriteeriPrioriteetti,
        tila,
        arvo,
        selite,
      });
    },
    onError: (e) => {
      addToast({
        key: 'set-harkinnanvaraiset-tilat-error',
        message: 'harkinnanvaraiset.virhe-tallenna',
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: () => {
      addToast({
        key: 'set-harkinnanvaraiset-tilat-success',
        message: 'harkinnanvaraiset.tallennettu',
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

  const { mutate, isPending } = useJarjestyskriteeriMutation({
    hakemusOid: jonosija.hakemusOid,
    valintatapajonoOid: valintatapajono.oid,
    jarjestyskriteeriPrioriteetti,
    hakuOid,
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
        <ModalActions onClose={onClose} onSave={() => mutate(muokkausParams)} />
      }
    >
      {isPending ? (
        <FullClientSpinner />
      ) : (
        <Grid2 container rowSpacing={2} sx={{ paddingY: 4 }}>
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
            label={t('henkilo.taulukko.jarjestyskriteeri')}
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
        </Grid2>
      )}
    </OphModalDialog>
  );
});
