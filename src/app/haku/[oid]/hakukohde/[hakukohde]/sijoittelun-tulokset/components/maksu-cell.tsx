import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import { MaksunTila } from '@/lib/ataru/ataru-types';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent } from '@mui/material';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnan-tulos-machine';

export const MaksuCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
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
