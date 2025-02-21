import { IlmoittautumisTila } from '../lib/types/sijoittelu-types';
import { useTranslations } from './useTranslations';

export const useIlmoittautumisTilaOptions = () => {
  const { t } = useTranslations();
  return Object.values(IlmoittautumisTila).map((tila) => ({
    value: tila as string,
    label: t(`ilmoittautumistila.${tila}`),
  }));
};
