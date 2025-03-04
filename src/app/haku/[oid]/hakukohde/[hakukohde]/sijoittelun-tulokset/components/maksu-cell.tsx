import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { MaksunTila } from '@/app/lib/ataru/ataru-types';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';

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
  const { hakemusOid, maksunTila } = hakemus;

  const maksunTilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  const updateMaksunTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid,
      maksunTila: event.target.value as MaksunTila,
    });
  };

  return maksunTila ? (
    <LocalizedSelect
      value={maksunTila}
      onChange={updateMaksunTila}
      options={maksunTilaOptions}
      disabled={disabled}
    />
  ) : (
    <></>
  );
};
