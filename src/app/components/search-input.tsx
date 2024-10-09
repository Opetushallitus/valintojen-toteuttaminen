import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment, OutlinedInput, styled } from '@mui/material';
import { ChangeEvent } from 'react';

const StyledContol = styled(OphFormControl)(() => ({
  flexGrow: 0,
  minWidth: '380px',
  textAlign: 'left',
}));

export type SearchInputProps = {
  name: string;
  searchPhrase: string;
  setSearchPhrase: (s: string) => void;
  label?: string;
  sx?: React.CSSProperties;
};

export const SearchInput = ({
  name,
  searchPhrase,
  setSearchPhrase,
  label,
  sx,
}: SearchInputProps) => {
  const { t } = useTranslations();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <StyledContol
      key={searchPhrase}
      sx={sx ?? {}}
      label={t(label ?? 'hakeneet.hae')}
      renderInput={({ labelId }) => (
        <OutlinedInput
          id={name}
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
