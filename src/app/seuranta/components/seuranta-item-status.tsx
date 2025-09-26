'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { LaskentaProgressBar } from '@/components/ValintalaskentaStatus';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { timeFromNow } from '@/lib/time-utils';
import { AccessTime } from '@mui/icons-material';

export const SeurantaItemStatus = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();

  //TODO kuka teki
  return (
    <Box
      sx={{
        flexGrow: 2,
        display: 'flex',
        flexDirection: 'column',
        rowGap: '5px',
        gridArea: 'status',
      }}
    >
      <Typography variant="h5">
        {t(`valintalaskenta.tila.${seurantaTiedot.tila}`)}{' '}
        {toFormattedDateTimeString(seurantaTiedot.luotu)}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: '3px',
          flexWrap: 'wrap',
        }}
      >
        <AccessTime />
        <Typography variant="body1">
          {t('seuranta.valmistunut', {
            timeFromNow: timeFromNow(seurantaTiedot.luotu),
          })}
        </Typography>
      </Box>
      <LaskentaProgressBar seurantaTiedot={seurantaTiedot} />
    </Box>
  );
};
