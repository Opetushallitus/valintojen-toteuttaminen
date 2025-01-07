import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTuloksetSearch';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { Haku } from '@/app/lib/types/kouta-types';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { SearchInput } from '@/app/components/search-input';
import { OtherActionsHakukohdeButton } from './other-actions-hakukohde-button';

export const SijoittelunTulosControls = ({ haku }: { haku: Haku }) => {
  const {
    searchPhrase,
    setSearchPhrase,
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
        <SearchInput
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          name="sijoittelun-tulos-search"
        />
        <OphFormFieldWrapper
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
        {isKorkeakouluHaku(haku) && (
          <OphCheckbox
            checked={showOnlyEhdolliset}
            onChange={changeShowOnlyEhdolliset}
            label={t('sijoittelun-tulokset.nayta-ehdolliset')}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <OtherActionsHakukohdeButton disabled={false} />
      </Box>
    </Box>
  );
};
