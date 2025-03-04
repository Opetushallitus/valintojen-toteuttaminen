import { useHakijaryhmatSearchParams } from '../hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/lib/types/sijoittelu-types';
import { LocalizedSelect } from '@/components/localized-select';
import { SearchInput } from '@/components/search-input';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';

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
      <OphFormFieldWrapper
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
      <OphFormFieldWrapper
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

      <OphFormFieldWrapper
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
