import { useHakijaryhmatSearchParams } from '@/app/hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import {
  FormControl,
  FormLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { ChangeEvent } from 'react';

export const HakijaryhmatSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakijaryhmatSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <FormControl
      sx={{
        flexGrow: 0,
        minWidth: '380px',
        textAlign: 'left',
      }}
    >
      <FormLabel htmlFor="hakijaryhmat-search">{t('hakeneet.hae')}</FormLabel>
      <OutlinedInput
        id="hakijaryhmat-search"
        name="hakijaryhmat-search"
        defaultValue={searchPhrase}
        onChange={handleSearchChange}
        autoFocus={true}
        type="text"
        endAdornment={
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
