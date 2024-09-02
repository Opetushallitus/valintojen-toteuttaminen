import { useHakijaryhmatSearchParams } from '@/app/hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { HakijaryhmatSearch } from './hakijaryhmat-search';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { OphFormControl } from '@/app/components/oph-form-control';
import { OphSelect } from '@/app/components/oph-select';

export const HakijaryhmatControls = () => {
  const {
    kuuluuRyhmaan,
    setKuuluuRyhmaan,
    hyvaksyttyRyhmasta,
    setHyvaksyttyRyhmasta,
    sijoittelunTila,
    setSijoittelunTila,
  } = useHakijaryhmatSearchParams();
  const { t } = useTranslations();

  const changeKuuluuRyhmaan = (e: SelectChangeEvent) => {
    setKuuluuRyhmaan(e.target.value);
  };

  const changeHyvaksyttyRyhmasta = (e: SelectChangeEvent) => {
    setHyvaksyttyRyhmasta(e.target.value);
  };

  const changeSijoittelunTila = (e: SelectChangeEvent) => {
    setSijoittelunTila(e.target.value);
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: 2,
      }}
    >
      <HakijaryhmatSearch />
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('hakijaryhmat.taulukko.kuuluminen')}
        renderInput={({ labelId }) => (
          <OphSelect
            id="kuuluu-ryhmaan-select"
            labelId={labelId}
            value={kuuluuRyhmaan}
            onChange={changeKuuluuRyhmaan}
            options={[
              { value: 'true', label: t('yleinen.kylla') },
              { value: 'false', label: t('yleinen.ei') },
            ]}
            clearable
          />
        )}
      />
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('hakijaryhmat.taulukko.sijoittelun-tila')}
        renderInput={({ labelId }) => (
          <OphSelect
            id="sijoittelun-tila-select"
            labelId={labelId}
            value={sijoittelunTila}
            onChange={changeSijoittelunTila}
            options={sijoitteluntilaOptions}
            clearable
          />
        )}
      />

      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('hakijaryhmat.taulukko.hyvaksytty')}
        renderInput={({ labelId }) => (
          <OphSelect
            id="hyvaksytty-ryhmasta-select"
            labelId={labelId}
            value={hyvaksyttyRyhmasta}
            onChange={changeHyvaksyttyRyhmasta}
            options={[
              { value: 'true', label: t('yleinen.kylla') },
              { value: 'false', label: t('yleinen.ei') },
            ]}
            clearable
          />
        )}
      />
    </Box>
  );
};
