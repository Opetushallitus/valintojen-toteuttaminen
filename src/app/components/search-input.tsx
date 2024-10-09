import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { ChangeEvent } from 'react';

export type SearchParams = {
  name: string;
  searchPhrase: string;
  setSearchPhrase: (s: string) => void;
  labelLocalizationKey?: string;
  flexGrow?: number;
};

export const SearchInput = ({
  name,
  searchPhrase,
  setSearchPhrase,
  labelLocalizationKey,
  flexGrow,
}: SearchParams) => {
  const { t } = useTranslations();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      key={searchPhrase}
      sx={{
        flexGrow: flexGrow ?? 0,
        minWidth: '380px',
        textAlign: 'left',
      }}
      label={t(labelLocalizationKey ?? 'hakeneet.hae')}
      renderInput={({ labelId }) => (
        <OutlinedInput
          name={name}
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
