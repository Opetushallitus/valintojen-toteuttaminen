import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { SelectChangeEvent } from '@mui/material';

export const MaksuCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();
  const { maksuntila } = hakemus;

  const maksuntilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  const updateMaksunTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      maksunTila: event.target.value as MaksunTila,
    });
  };

  return hakemus.maksuntila ? (
    <LocalizedSelect
      value={maksuntila}
      onChange={updateMaksunTila}
      options={maksuntilaOptions}
      disabled={disabled}
    />
  ) : (
    <></>
  );
};
