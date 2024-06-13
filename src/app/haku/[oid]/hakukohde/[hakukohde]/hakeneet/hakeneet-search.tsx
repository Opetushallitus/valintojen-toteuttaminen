import { useHakeneetSearchParams } from '@/app/hooks/useHakeneetSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import {
  FormControl,
  FormLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { ChangeEvent } from 'react';

export const HakeneetSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakeneetSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <FormControl
      sx={{
        flexGrow: 4,
        minWidth: '380px',
        textAlign: 'left',
      }}
    >
      <FormLabel htmlFor="hakeneet-search" sx={{ fontWeight: 600 }}>
        {t('hakeneet.hae')}
      </FormLabel>
      <OutlinedInput
        id="hakeneet-search"
        name="hakeneet-search"
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

export default HakeneetSearch;
