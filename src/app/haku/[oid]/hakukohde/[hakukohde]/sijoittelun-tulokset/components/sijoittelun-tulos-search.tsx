import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Search } from '@mui/icons-material';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { ChangeEvent } from 'react';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTuloksetSearch';

export const SijoittelunTulosSearch = ({
  valintatapajonoOid,
}: {
  valintatapajonoOid: string;
}) => {
  const { searchPhrase, setSearchPhrase } =
    useSijoittelunTulosSearchParams(valintatapajonoOid);
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
          name="sijoittelun-tulos-search"
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
