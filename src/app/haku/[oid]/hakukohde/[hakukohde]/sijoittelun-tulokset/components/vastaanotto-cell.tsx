import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { SelectChangeEvent, Typography } from '@mui/material';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import {
  isVastaanottotilaJulkaistavissa,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { useIsHakuPublishAllowed } from '@/app/hooks/useIsHakuPublishAllowed';
import { Haku } from '@/app/lib/kouta/kouta-types';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { useVastaanottoTilaOptions } from '@/app/hooks/useVastaanottoTilaOptions';

export const VastaanOttoCell = ({
  haku,
  hakemus,
  disabled,
  updateForm,
}: {
  haku: Haku;
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const isPublishAllowed = useIsHakuPublishAllowed({ haku });

  const { julkaistavissa, vastaanottotila } = hakemus;

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    const tila = event.target.value as VastaanottoTila;
    updateForm({ hakemusOid: hakemus.hakemusOid, vastaanottotila: tila });
  };

  const updateJulkaistu = () => {
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
          !isPublishAllowed
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
          ariaLabel={t('sijoittelun-tulokset.taulukko.vastaanottotieto')}
          value={vastaanottotila}
          onChange={updateVastaanottoTila}
          options={vastaanottotilaOptions}
          disabled={disabled}
        />
      )}
    </SijoittelunTulosStyledCell>
  );
};
