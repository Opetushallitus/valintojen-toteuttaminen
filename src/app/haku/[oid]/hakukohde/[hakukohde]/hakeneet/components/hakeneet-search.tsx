import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useHakeneetSearchParams } from '@/app/hooks/useHakeneetSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { ChangeEvent } from 'react';

export const HakeneetSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakeneetSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      label={t('hakeneet.hae')}
      sx={{
        flexGrow: 4,
        minWidth: '380px',
        textAlign: 'left',
      }}
      renderInput={({ labelId }) => (
        <OutlinedInput
          inputProps={{ 'aria-labelledby': labelId }}
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
      )}
    />
  );
};

export default HakeneetSearch;
