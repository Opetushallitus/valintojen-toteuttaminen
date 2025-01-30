import { Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { useHarkinnanvaraisetSearchParams } from '../hooks/useHarkinnanvaraisetSearchParams';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ChangeEvent } from 'react';
import {
  OphFormFieldWrapper,
  OphInput,
} from '@opetushallitus/oph-design-system';

export const HarkinnanvaraisetSearchInput = () => {
  const { searchPhrase, setSearchPhrase } = useHarkinnanvaraisetSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormFieldWrapper
      label={t('harkinnanvaraiset.hae')}
      sx={{
        minWidth: '380px',
        textAlign: 'left',
      }}
      renderInput={({ labelId }) => (
        <OphInput
          inputProps={{ 'aria-labelledby': labelId }}
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
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
