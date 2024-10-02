import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { MaksunTila } from '@/app/lib/types/ataru-types';
import { SijoittelunHakemusEnriched } from '@/app/lib/types/sijoittelu-types';

export const MaksuCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const maksuntilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  return hakemus.maksuntila ? (
    <LocalizedSelect
      value={hakemus.maksuntila}
      onChange={() => ''}
      options={maksuntilaOptions}
    />
  ) : (
    <></>
  );
};
