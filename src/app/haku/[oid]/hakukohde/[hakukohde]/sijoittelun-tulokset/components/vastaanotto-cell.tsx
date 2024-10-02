import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusEnriched,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';

export const VastaanOttoCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  return (
    <SijoittelunTulosStyledCell>
      <FormControlLabel
        label={t('sijoittelun-tulokset.julkaistavissa')}
        control={
          <Checkbox checked={hakemus.julkaistavissa} onChange={() => ''} />
        }
      />
      {hakemus.vastaanottoDeadline && (
        <Typography>
          {t('sijoittelun-tulokset.vastaanottoaikaraja')}:{' '}
          {toFormattedDateTimeString(hakemus.vastaanottoDeadline)}
        </Typography>
      )}
      <OphFormControl
        label={t('sijoittelun-tulokset.hakijalle-naytetaan')}
        sx={{ fontWeight: 400 }}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            labelId={labelId}
            value={hakemus.vastaanottotila}
            onChange={() => ''}
            options={vastaanottotilaOptions}
          />
        )}
      />
    </SijoittelunTulosStyledCell>
  );
};
