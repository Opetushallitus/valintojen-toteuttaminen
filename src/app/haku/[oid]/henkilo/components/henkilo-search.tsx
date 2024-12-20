'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { ChangeEvent } from 'react';
import { useHenkiloSearchParams } from '../hooks/useHenkiloSearch';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { OphInput } from '@opetushallitus/oph-design-system';

export const HenkiloSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHenkiloSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      sx={{
        textAlign: 'left',
        paddingRight: 2,
      }}
      helperText={t('henkilo.hae-helpertext')}
      renderInput={() => {
        return (
          <OphInput
            key={searchPhrase}
            id="henkilo-search"
            name="henkilo-search"
            defaultValue={searchPhrase}
            onChange={handleSearchChange}
            autoFocus={true}
            type="text"
            placeholder={t('henkilo.hae-henkilo')}
            endAdornment={
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            }
          />
        );
      }}
    ></OphFormControl>
  );
};
