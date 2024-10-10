import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';

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

  const maksuntilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  return hakemus.maksuntila ? (
    <LocalizedSelect
      value={hakemus.maksuntila}
      onChange={(event) =>
        updateForm({
          hakemusOid: hakemus.hakemusOid,
          maksunTila: event.target.value as MaksunTila,
        })
      }
      options={maksuntilaOptions}
      disabled={disabled}
    />
  ) : (
    <></>
  );
};
