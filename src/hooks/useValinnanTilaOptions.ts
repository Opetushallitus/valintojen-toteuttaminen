import { ValinnanTila } from '@/lib/types/sijoittelu-types';
import { useTranslations } from '@/lib/localization/useTranslations';

export const useValinnanTilaOptions = (
  filterFn: (tila: ValinnanTila) => boolean = () => true,
) => {
  const { t } = useTranslations();
  return Object.values(ValinnanTila)
    .filter(filterFn)
    .map((tila) => ({
      value: tila as string,
      label: t(`sijoitteluntila.${tila}`),
    }));
};
