import { VastaanottoTila } from '../lib/types/sijoittelu-types';
import { useTranslations } from '../lib/localization/useTranslations';

export const useVastaanottoTilaOptions = (
  filterFn: (tila: VastaanottoTila) => boolean = () => true,
) => {
  const { t } = useTranslations();
  return Object.values(VastaanottoTila)
    .filter(filterFn)
    .map((tila) => ({
      value: tila as string,
      label: t(`vastaanottotila.${tila}`),
    }));
};
