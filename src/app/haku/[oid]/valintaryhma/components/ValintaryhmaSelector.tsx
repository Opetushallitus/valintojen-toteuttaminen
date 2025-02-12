'use client';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export type ValintaryhmaSelectorProps = {
  valintaryhmat: ValintaryhmaHakukohteilla[];
  onValintaryhmaSelect: (valintaryhma: ValintaryhmaHakukohteilla | null) => void;
};

export const ValintaryhmaSelector = ({ valintaryhmat, onValintaryhmaSelect }: ValintaryhmaSelectorProps) => {

  const { t } = useTranslations();

  return (
    <Autocomplete
      disablePortal
      options={valintaryhmat}
      sx={{width: 400}} 
      renderInput={(params) => <TextField {...params} label={t('valintaryhmittain.valintaryhma')}/>}
      getOptionLabel={(option) => option.nimi}
      onChange={(event, value) => onValintaryhmaSelect(value)}
      value={valintaryhmat[0]}/>
  );
};