import { useHakukohdeSearchParams } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { FormControl, InputAdornment } from '@mui/material';
import { OphInput } from '@opetushallitus/oph-design-system';
import { ChangeEvent } from 'react';

export const HakukohdeSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakukohdeSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <FormControl
      sx={{
        textAlign: 'left',
        paddingRight: 2,
      }}
    >
      <OphInput
        key={searchPhrase}
        id="hakukohde-search"
        name="hakukohde-search"
        defaultValue={searchPhrase}
        onChange={handleSearchChange}
        autoFocus={true}
        type="text"
        placeholder={t('haku.haehakukohde')}
        endAdornment={
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
