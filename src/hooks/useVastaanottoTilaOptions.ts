import { VastaanottoTila } from '../lib/types/sijoittelu-types';
import { useTranslations } from '../lib/localization/useTranslations';

export const useVastaanottoTilaOptions = () => {
  const { t } = useTranslations();
  return Object.values(VastaanottoTila).map((tila) => ({
    value: tila as string,
    label: t(`vastaanottotila.${tila}`),
  }));
};
