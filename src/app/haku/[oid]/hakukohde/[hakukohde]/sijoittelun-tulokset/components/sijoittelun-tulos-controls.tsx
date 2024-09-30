import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosSearch } from './sijoittelun-tulos-search';
import { OphCheckbox } from '@opetushallitus/oph-design-system';

export const SijoittelunTulosControls = () => {
  const {
    sijoittelunTila,
    setSijoittelunTila,
    showOnlyEhdolliset,
    setShowOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa,
  } = useSijoittelunTulosSearchParams();

  const { t } = useTranslations();

  const changeSijoittelunTila = (e: SelectChangeEvent) => {
    setSijoittelunTila(e.target.value);
  };

  const changeShowOnlyEhdolliset = () => {
    setShowOnlyEhdolliset(!showOnlyEhdolliset);
  };

  const changeShowOnlyMuuttuneetViimeSijoittelussa = () => {
    setShowOnlyMuuttuneetViimeSijoittelussa(
      !showOnlyMuuttuneetViimeSijoittelussa,
    );
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
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
          label={t('sijoittelun-tulokset.taulukko.tila')}
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
      <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2 }}>
        <OphCheckbox
          checked={showOnlyMuuttuneetViimeSijoittelussa}
          onChange={changeShowOnlyMuuttuneetViimeSijoittelussa}
          label={t('sijoittelun-tulokset.nayta-muuttuneet')}
        />
        <OphCheckbox
          checked={showOnlyEhdolliset}
          onChange={changeShowOnlyEhdolliset}
          label={t('sijoittelun-tulokset.nayta-ehdolliset')}
        />
      </Box>
    </Box>
  );
};
