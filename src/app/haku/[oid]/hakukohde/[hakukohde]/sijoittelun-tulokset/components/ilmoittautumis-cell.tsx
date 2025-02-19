import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { SelectChangeEvent } from '@mui/material';
import { isIlmoittautuminenPossible } from '@/app/lib/sijoittelun-tulokset-utils';

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

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

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
