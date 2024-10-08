import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Typography } from '@mui/material';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useState } from 'react';
import { StyledOphCheckBox } from '@/app/components/form/styled-oph-checkbox';

export const VastaanOttoCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
}) => {
  const { t } = useTranslations();

  const [julkaistavissa, setJulkaistavissa] = useState(hakemus.julkaistavissa);

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  return (
    <SijoittelunTulosStyledCell>
      <StyledOphCheckBox
        checked={julkaistavissa}
        onChange={() => setJulkaistavissa(!julkaistavissa)}
        label={t('sijoittelun-tulokset.julkaistavissa')}
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
