import { SijoittelunTila } from '@/lib/types/sijoittelu-types';
import { useTranslations } from '@/lib/localization/useTranslations';

export const useValinnanTilaOptions = (
  filterFn: (tila: SijoittelunTila) => boolean = () => true,
) => {
  const { t } = useTranslations();
  return Object.values(SijoittelunTila)
    .filter(filterFn)
    .map((tila) => ({
      value: tila as string,
      label: t(`sijoitteluntila.${tila}`),
    }));
};
