import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SelectChangeEvent, Typography } from '@mui/material';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import {
  isVastaanottotilaJulkaistavissa,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';

export const VastaanOttoCell = ({
  hakemus,
  disabled,
  updateForm,
  publishAllowed,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
  publishAllowed: boolean;
}) => {
  const { t } = useTranslations();

  const [julkaistavissa, setJulkaistavissa] = useState(hakemus.julkaistavissa);
  const [vastaanottoTila, setVastaanottoTila] = useState(
    hakemus.vastaanottotila,
  );

  useEffect(() => {
    setVastaanottoTila(hakemus.vastaanottotila);
  }, [hakemus.vastaanottotila]);

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
      <OphCheckbox
        checked={julkaistavissa}
        onChange={updateJulkaistu}
        label={t('sijoittelun-tulokset.julkaistavissa')}
        disabled={
          disabled ||
          !isVastaanottotilaJulkaistavissa(hakemus) ||
          !publishAllowed
        }
      />
      {hakemus.vastaanottoDeadline && (
        <Typography>
          {t('sijoittelun-tulokset.vastaanottoaikaraja')}:{' '}
          {toFormattedDateTimeString(hakemus.vastaanottoDeadline)}
        </Typography>
      )}
      {isVastaanottoPossible(hakemus) && (
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
