import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';
import { SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { isIlmoittautumistilaEditable } from '@/app/lib/sijoittelun-tulokset-utils';

export const IlmoittautumisCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
}) => {
  const { t } = useTranslations();
  const [ilmoittautumisTila, setIlmoittautumisTila] = useState(
    hakemus.ilmoittautumisTila,
  );

  useEffect(() => {
    setIlmoittautumisTila(hakemus.ilmoittautumisTila);
  }, [hakemus.ilmoittautumisTila]);

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  const showSelect = isIlmoittautumistilaEditable(hakemus);

  const updateIlmoittautumisTila = (event: SelectChangeEvent<string>) => {
    const tila = event.target.value as IlmoittautumisTila;
    setIlmoittautumisTila(tila);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ilmoittautumisTila: tila,
    });
  };

  return (
    <>
      {showSelect && (
        <LocalizedSelect
          value={ilmoittautumisTila}
          onChange={updateIlmoittautumisTila}
          options={ilmoittautumistilaOptions}
          disabled={disabled}
        />
      )}
    </>
  );
};
