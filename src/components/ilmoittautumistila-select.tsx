import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { isIlmoittautuminenPossible } from '@/lib/sijoittelun-tulokset-utils';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';

export const IlmoittautumisTilaSelect = ({
  hakemus,
  disabled,
  onChange: onChange,
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
  onChange: (newIlmoittautumistila: IlmoittautumisTila) => void;
}) => {
  const { t } = useTranslations();

  const { ilmoittautumisTila } = hakemus;

  const ilmoittautumistilaOptions = useIlmoittautumisTilaOptions();

  const isVisible = isIlmoittautuminenPossible(hakemus);

  const updateIlmoittautumisTila = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as IlmoittautumisTila);
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
