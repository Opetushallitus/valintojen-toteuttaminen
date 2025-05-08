import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { isIlmoittautuminenPossible } from '@/lib/sijoittelun-tulokset-utils';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';
import { SijoittelunTulosChangeParams } from '@/app/haku/[oid]/hakukohde/[hakukohde]/sijoittelun-tulokset/lib/sijoittelun-tulokset-state';

export const IlmoittautumisTilaSelect = ({
  hakemus,
  disabled,
  updateForm
}: {
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
    | 'hakemusOid'
    | 'ilmoittautumisTila'
    | 'tila'
    | 'vastaanottotila'
    | 'julkaistavissa'
  >;
  disabled?: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
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
          value={ilmoittautumisTila}
          onChange={updateIlmoittautumisTila}
          options={ilmoittautumistilaOptions}
          disabled={disabled}
        />
      )}
    </>
  );
};
