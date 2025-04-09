import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunTulosBasicInfo } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { InfoOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { isNullish } from 'remeda';

export const SijoitteluBasicInfo = ({
  basicInfo,
}: {
  basicInfo?: SijoittelunTulosBasicInfo | null;
}) => {
  const { t } = useTranslations();

  return isNullish(basicInfo) ? null : (
    <Typography
      variant="body1"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        marginTop: 1,
        marginBottom: 2,
        columnGap: 1,
      }}
    >
      <InfoOutlined htmlColor={ophColors.blue2} />
      {t('yhteisvalinnan-hallinta.sijoittelu.ajettu', {
        alku: toFormattedDateTimeString(basicInfo.startDate),
        loppu: toFormattedDateTimeString(basicInfo.endDate),
      })}
    </Typography>
  );
};
