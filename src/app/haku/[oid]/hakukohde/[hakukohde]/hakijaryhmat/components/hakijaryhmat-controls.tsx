import { useHakijaryhmatSearchParams } from '../hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SearchInput } from '@/app/components/search-input';

export const HakijaryhmatControls = () => {
  const {
    searchPhrase,
    setSearchPhrase,
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

  const sijoitteluntilaOptions = Object.values(SijoittelunTila)
    .filter((tila) => tila !== SijoittelunTila.HARKINNANVARAISESTI_HYVAKSYTTY)
    .map((tila) => {
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
      <SearchInput
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        name="hakijaryhmat-search"
      />
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('hakijaryhmat.taulukko.kuuluminen')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
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
          <LocalizedSelect
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
          <LocalizedSelect
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
