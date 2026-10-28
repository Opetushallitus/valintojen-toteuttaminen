import { useTranslations } from '@/lib/localization/useTranslations';
import { formatArvo } from '../lib/valintalaskentahistoriaUtils';

// Puuttuva arvo näytetään tekstinä eikä viivana, jottei se sekoitu rivin erotinviivaan
export const AvaimenArvo = ({ arvo }: { arvo: unknown }) => {
  const { t } = useTranslations();
  return arvo == null
    ? t('valintalaskentahistoria.ei-arvoa')
    : formatArvo(arvo);
};
