import { useTranslations } from '@/app/lib/localization/useTranslations';
import { Search } from '@mui/icons-material';
import { FormControl, InputAdornment } from '@mui/material';
import { OphInput } from '@opetushallitus/oph-design-system';
import { ChangeEvent } from 'react';
import { useValintaryhmaSearchParams } from '../hooks/useValintaryhmaSearch';

export const ValintaryhmaSearch = () => {
  const { searchPhrase, setSearchPhrase } = useValintaryhmaSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <FormControl
      sx={{
        textAlign: 'left',
        paddingRight: 2,
      }}
    >
      <OphInput
        key={searchPhrase}
        id="valintaryhma-search"
        name="valintaryhma-search"
        defaultValue={searchPhrase}
        onChange={handleSearchChange}
        autoFocus={true}
        type="text"
        placeholder={t('valintaryhmittain.hae')}
        endAdornment={
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
