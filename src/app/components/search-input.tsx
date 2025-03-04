import { useTranslations } from '@/app/lib/localization/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { ChangeEvent, useEffect, useRef } from 'react';
import { styled } from '@/app/lib/theme';
import {
  OphFormFieldWrapper,
  OphInput,
} from '@opetushallitus/oph-design-system';

const StyledFormFieldWrapper = styled(OphFormFieldWrapper)({
  flexGrow: 0,
  flexBasis: '380px',
  minWidth: '200px',
  textAlign: 'left',
});

export type SearchInputProps = {
  name?: string;
  searchPhrase: string;
  setSearchPhrase: (s: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  sx?: React.CSSProperties;
  hiddenLabel?: boolean;
};

export const SearchInput = ({
  name,
  searchPhrase,
  setSearchPhrase,
  label,
  placeholder,
  helperText,
  hiddenLabel,
  sx,
}: SearchInputProps) => {
  const { t } = useTranslations();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchPhrase;
    }
  }, [searchPhrase]);

  const labelText = t(label ?? 'hakeneet.hae');

  return (
    <StyledFormFieldWrapper
      sx={sx ?? {}}
      label={hiddenLabel ? undefined : t(label ?? 'hakeneet.hae')}
      helperText={helperText}
      renderInput={({ labelId }) => (
        <OphInput
          id={name}
          name={name}
          inputRef={inputRef}
          inputProps={
            hiddenLabel
              ? { 'aria-label': labelText }
              : { 'aria-labelledby': labelId }
          }
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
          type="text"
          placeholder={placeholder}
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
