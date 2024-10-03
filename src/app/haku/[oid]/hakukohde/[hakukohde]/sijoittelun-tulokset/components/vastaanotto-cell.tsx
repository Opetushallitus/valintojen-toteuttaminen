import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusEnriched,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useState } from 'react';

export const VastaanOttoCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const [julkaistavissa, setJulkaistavissa] = useState(hakemus.julkaistavissa);

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  return (
    <SijoittelunTulosStyledCell>
      <FormControlLabel
        label={t('sijoittelun-tulokset.julkaistavissa')}
        control={
          <Checkbox
            checked={julkaistavissa}
            onChange={() => setJulkaistavissa(!julkaistavissa)}
          />
        }
      />
      {hakemus.vastaanottoDeadline && (
        <Typography>
          {t('sijoittelun-tulokset.vastaanottoaikaraja')}:{' '}
          {toFormattedDateTimeString(hakemus.vastaanottoDeadline)}
        </Typography>
      )}
      {hakemus.naytetaanVastaanottoTieto && julkaistavissa && (
        <LocalizedSelect
          value={hakemus.vastaanottotila}
          onChange={() => ''}
          options={vastaanottotilaOptions}
        />
      )}
    </SijoittelunTulosStyledCell>
  );
};
