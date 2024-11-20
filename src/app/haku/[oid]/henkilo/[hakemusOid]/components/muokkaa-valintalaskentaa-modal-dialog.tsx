import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton, OphSelect } from '@opetushallitus/oph-design-system';
import { FormLabel, Grid2, Stack } from '@mui/material';
import { OphInput } from '@/app/components/form/oph-input';
import { useId, useState } from 'react';
import { LaskettuJono } from '@/app/hooks/useLasketutValinnanVaiheet';
import { mapKeys } from 'remeda';
import { Jarjestyskriteeri } from '@/app/lib/types/laskenta-types';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakutoiveTitle } from './hakutoive-title';

const ModalActions = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" spacing={2}>
      <OphButton variant="outlined" onClick={onClose}>
        {t('yleinen.peruuta')}
      </OphButton>
      <OphButton variant="contained" disabled={true}>
        {t('henkilo.poista-muokkaus')}
      </OphButton>
      <OphButton variant="contained">{t('yleinen.tallenna')}</OphButton>
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
  jarjestyskriteeri,
}: {
  jarjestyskriteeri: Jarjestyskriteeri;
}) => {
  const { t, translateEntity } = useTranslations();

  const [pisteet, setPisteet] = useState(
    () => jarjestyskriteeri?.arvo?.toString() ?? '',
  );

  const [valintatieto, setValintatieto] = useState(
    () => jarjestyskriteeri.tila,
  );

  const tuloksenTilaOptions = Object.values(TuloksenTila).map((value) => ({
    value: value,
    label: t('tuloksenTila.' + value),
  }));

  const [muokkauksenSyy, setMuokkauksenSyy] = useState<string>(() =>
    translateEntity(
      mapKeys(jarjestyskriteeri.kuvaus ?? {}, (k) => k.toLowerCase()),
    ),
  );

  return (
    <>
      <InlineFormControl
        label={t('henkilo.taulukko.pisteet')}
        renderInput={() => (
          <OphInput
            value={pisteet}
            onChange={(e) => setPisteet(e.target.value)}
          />
        )}
      />
      <InlineFormControl
        label={t('henkilo.taulukko.valintatieto')}
        renderInput={({ labelId }) => (
          <OphSelect
            sx={{ width: '100%' }}
            labelId={labelId}
            value={valintatieto}
            options={tuloksenTilaOptions}
            onChange={(e) => setValintatieto(e.target.value)}
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
            value={muokkauksenSyy}
            onChange={(e) => setMuokkauksenSyy(e.target.value)}
            notched={false}
          />
        )}
      />
    </>
  );
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
    useState(() => '0');

  const jarjestyskriteeriOptions = jonosija.jarjestyskriteerit.map(
    ({ nimi, prioriteetti }) => ({
      value: prioriteetti.toString(),
      label: nimi,
    }),
  );

  const jarjestyskriteeri =
    jonosija.jarjestyskriteerit[Number(jarjestyskriteeriPrioriteetti)];

  return (
    <OphModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={t('henkilo.muokkaa-valintalaskentaa')}
      maxWidth="lg"
      titleAlign="left"
      onClose={onClose}
      actions={<ModalActions onClose={onClose} />}
    >
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
              value={jarjestyskriteeriPrioriteetti}
              options={jarjestyskriteeriOptions}
              onChange={(e) => setJarjestyskriteeriPrioriteetti(e.target.value)}
            />
          )}
        />
        <JarjestyskriteeriFields
          key={jarjestyskriteeriPrioriteetti}
          jarjestyskriteeri={jarjestyskriteeri}
        />
      </Grid2>
    </OphModalDialog>
  );
});
