import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { isIlmoittautuminenPossible } from '@/lib/sijoittelun-tulokset-utils';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';

export const IlmoittautumisCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const { ilmoittautumisTila } = hakemus;

  const ilmoittautumistilaOptions = useIlmoittautumisTilaOptions();

  const showSelect = isIlmoittautuminenPossible(hakemus);

  const updateIlmoittautumisTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ilmoittautumisTila: event.target.value as IlmoittautumisTila,
    });
  };

  return (
    <>
      {showSelect && (
        <LocalizedSelect
          ariaLabel={t('sijoittelun-tulokset.taulukko.ilmoittautumistieto')}
          value={ilmoittautumisTila}
          onChange={updateIlmoittautumisTila}
          options={ilmoittautumistilaOptions}
          disabled={disabled}
        />
      )}
    </>
  );
};
