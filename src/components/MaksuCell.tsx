import { LocalizedSelect } from '@/components/localized-select';
import { MaksunTila } from '@/lib/ataru/ataru-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnanTuloksetMachineTypes';
import { SelectChangeEvent } from '@mui/material';

type MaksuCellHakemus = {
  hakemusOid: string;
  maksunTila?: string;
};

export const MaksuCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: MaksuCellHakemus;
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
