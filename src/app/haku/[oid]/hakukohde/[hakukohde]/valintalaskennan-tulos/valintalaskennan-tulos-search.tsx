import { useJonosijatSearchParams } from '@/app/hooks/useJonosijatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import {
  FormControl,
  FormLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { ChangeEvent } from 'react';

export const ValintalaskennanTulosSearch = () => {
  const { searchPhrase, setSearchPhrase } = useJonosijatSearchParams();
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
      <FormLabel htmlFor="valintalaskennan-tulos-search">
        {t('hakeneet.hae')}
      </FormLabel>
      <OutlinedInput
        id="valintalaskennan-tulos-search"
        name="valintalaskennan-tulos-search"
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

export default ValintalaskennanTulosSearch;
