import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { SelectChangeEvent, Typography } from '@mui/material';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useState } from 'react';
import { StyledOphCheckBox } from '@/app/components/form/styled-oph-checkbox';
import { hakemukselleNaytetaanVastaanottoTila } from '../lib/sijoittelun-tulokset-utils';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';

export const VastaanOttoCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
}) => {
  const { t } = useTranslations();

  const [julkaistavissa, setJulkaistavissa] = useState(hakemus.julkaistavissa);
  const [vastaanottoTila, setVastaanottoTila] = useState(
    hakemus.vastaanottotila,
  );

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    const tila = event.target.value as VastaanottoTila;
    setVastaanottoTila(tila);
    updateForm({ hakemusOid: hakemus.hakemusOid, vastaanottotila: tila });
  };

  const updateJulkaistu = () => {
    setJulkaistavissa(!julkaistavissa);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      julkaistavissa: !julkaistavissa,
    });
  };

  return (
    <SijoittelunTulosStyledCell>
      <StyledOphCheckBox
        checked={julkaistavissa}
        onChange={updateJulkaistu}
        label={t('sijoittelun-tulokset.julkaistavissa')}
        disabled={disabled}
      />
      {hakemus.vastaanottoDeadline && (
        <Typography>
          {t('sijoittelun-tulokset.vastaanottoaikaraja')}:{' '}
          {toFormattedDateTimeString(hakemus.vastaanottoDeadline)}
        </Typography>
      )}
      {hakemukselleNaytetaanVastaanottoTila(hakemus) && (
        <LocalizedSelect
          value={vastaanottoTila}
          onChange={updateVastaanottoTila}
          options={vastaanottotilaOptions}
          disabled={disabled}
        />
      )}
    </SijoittelunTulosStyledCell>
  );
};
