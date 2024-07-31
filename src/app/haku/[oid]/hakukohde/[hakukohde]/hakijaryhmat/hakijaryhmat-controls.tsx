import { useHakijaryhmatSearchParams } from '@/app/hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { HakijaryhmatSearch } from './hakijaryhmat-search';
import { OphSelectControl } from '@/app/components/oph-select';
import theme from '@/app/theme';
import { SijoittelunTila } from '@/app/lib/valinta-tulos-service';

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
    return { value: tila, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: theme.spacing(2),
      }}
    >
      <HakijaryhmatSearch />
      <OphSelectControl
        formControlProps={{
          sx: {
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          },
        }}
        id="kuuluu-ryhmaan-select"
        label={t('hakijaryhmat.taulukko.kuuluminen')}
        value={kuuluuRyhmaan}
        onChange={changeKuuluuRyhmaan}
        options={[
          { value: 'true', label: t('yleinen.kylla') },
          { value: 'false', label: t('yleinen.ei') },
        ]}
        clearable
      />
      <OphSelectControl
        formControlProps={{
          sx: {
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          },
        }}
        id="sijoittelun-tila-select"
        label={t('hakijaryhmat.taulukko.sijoittelun-tila')}
        value={sijoittelunTila}
        onChange={changeSijoittelunTila}
        options={sijoitteluntilaOptions}
        clearable
      />
      <OphSelectControl
        formControlProps={{
          sx: {
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          },
        }}
        id="hyvaksytty-ryhmasta-select"
        label={t('hakijaryhmat.taulukko.hyvaksytty')}
        value={hyvaksyttyRyhmasta}
        onChange={changeHyvaksyttyRyhmasta}
        options={[
          { value: 'true', label: t('yleinen.kylla') },
          { value: 'false', label: t('yleinen.ei') },
        ]}
        clearable
      />
    </Box>
  );
};
