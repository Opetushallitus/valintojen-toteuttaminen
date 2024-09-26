import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, Checkbox, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosSearch } from './sijoittelun-tulos-search';

export const SijoittelunTulosControls = () => {
  const {
    sijoittelunTila,
    setSijoittelunTila,
    showOnlyEhdolliset,
    setShowOnlyEhdolliset,
  } = useSijoittelunTulosSearchParams();

  const { t } = useTranslations();

  const changeSijoittelunTila = (e: SelectChangeEvent) => {
    setSijoittelunTila(e.target.value);
  };

  const changeShowOnlyEhdolliset = () => {
    setShowOnlyEhdolliset(!showOnlyEhdolliset);
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 2,
        }}
      >
        <SijoittelunTulosSearch />
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
      </Box>
      <OphFormControl
        label="Näytä vain ehdolliset"
        renderInput={({ labelId }) => (
          <Checkbox
            id={labelId}
            checked={showOnlyEhdolliset}
            onChange={changeShowOnlyEhdolliset}
          />
        )}
      />
    </>
  );
};
