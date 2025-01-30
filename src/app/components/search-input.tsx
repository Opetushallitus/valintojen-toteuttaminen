import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { ChangeEvent } from 'react';
import { styled } from '@/app/lib/theme';
import {
  OphFormFieldWrapper,
  OphInput,
} from '@opetushallitus/oph-design-system';

const StyledContol = styled(OphFormFieldWrapper)({
  flexGrow: 0,
  flexBasis: '380px',
  minWidth: '200px',
  textAlign: 'left',
});

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
        <OphInput
          id={name}
          name={name}
          inputProps={{ 'aria-labelledby': labelId }}
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
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
