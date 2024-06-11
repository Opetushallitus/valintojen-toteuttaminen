import { useHakukohdeSearchParams } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { FormControl, InputAdornment, OutlinedInput } from '@mui/material';
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
        flexGrow: 4,
        minWidth: '180px',
        textAlign: 'left',
      }}
    >
      <OutlinedInput
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

export default HakukohdeSearch;
