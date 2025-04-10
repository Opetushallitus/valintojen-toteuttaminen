import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunTulosBasicInfo } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { isNullish } from 'remeda';
import { SijoitteluInfo } from './sijoittelu-info';

export const SijoitteluBasicInfo = ({
  basicInfo,
}: {
  basicInfo?: SijoittelunTulosBasicInfo | null;
}) => {
  const { t } = useTranslations();

  return isNullish(basicInfo) ? null : (
    <SijoitteluInfo
      text={t('yhteisvalinnan-hallinta.sijoittelu.ajettu', {
        alku: toFormattedDateTimeString(basicInfo.startDate),
        loppu: toFormattedDateTimeString(basicInfo.endDate),
      })}
      sxProps={{ marginBottom: 2 }}
    />
  );
};
