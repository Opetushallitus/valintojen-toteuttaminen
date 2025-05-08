import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { isIlmoittautuminenPossible } from '@/lib/sijoittelun-tulokset-utils';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnanTuloksetMachineTypes';

export const IlmoittautumisTilaSelect = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
    | 'hakemusOid'
    | 'ilmoittautumisTila'
    | 'valinnanTila'
    | 'vastaanottoTila'
    | 'julkaistavissa'
  >;
  disabled?: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const { ilmoittautumisTila } = hakemus;

  const ilmoittautumistilaOptions = useIlmoittautumisTilaOptions();

  const isVisible = isIlmoittautuminenPossible(hakemus);

  const updateIlmoittautumisTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ilmoittautumisTila: event.target.value as IlmoittautumisTila,
    });
  };

  return (
    <>
      {isVisible && (
        <LocalizedSelect
          ariaLabel={t('sijoittelun-tulokset.taulukko.ilmoittautumistieto')}
          value={ilmoittautumisTila ?? ''}
          onChange={updateIlmoittautumisTila}
          options={ilmoittautumistilaOptions}
          disabled={disabled}
        />
      )}
    </>
  );
};
