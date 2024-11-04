import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { FormControl, InputAdornment, OutlinedInput } from '@mui/material';
import { ChangeEvent } from 'react';
import { useHenkiloSearchParams } from '../hooks/useHenkiloSearchResults';

export const HenkiloSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHenkiloSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <FormControl
      sx={{
        minWidth: '180px',
        textAlign: 'left',
      }}
    >
      <OutlinedInput
        id="henkilo-search"
        name="henkilo-search"
        defaultValue={searchPhrase}
        onChange={handleSearchChange}
        autoFocus={true}
        type="text"
        placeholder={t('henkilo.haehenkilo')}
        endAdornment={
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};

export default HenkiloSearch;
