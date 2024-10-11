import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';
import { useState } from 'react';
import { SelectChangeEvent } from '@mui/material';

export const MaksuCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
}) => {
  const { t } = useTranslations();
  const [maksunTila, setMaksunTila] = useState(hakemus.maksuntila);

  const maksuntilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  const updateMaksunTila = (event: SelectChangeEvent<string>) => {
    const tila = event.target.value as MaksunTila;
    setMaksunTila(tila);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      maksunTila: tila,
    });
  };

  return hakemus.maksuntila ? (
    <LocalizedSelect
      value={maksunTila}
      onChange={updateMaksunTila}
      options={maksuntilaOptions}
      disabled={disabled}
    />
  ) : (
    <></>
  );
};
