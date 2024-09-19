import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useHakijaryhmatSearchParams } from '../hooks/useHakijaryhmatSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { ChangeEvent } from 'react';

export const HakijaryhmatSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakijaryhmatSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      sx={{
        flexGrow: 0,
        minWidth: '380px',
        textAlign: 'left',
      }}
      label={t('hakeneet.hae')}
      renderInput={({ labelId }) => (
        <OutlinedInput
          name="hakijaryhmat-search"
          inputProps={{ 'aria-labelledby': labelId }}
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
