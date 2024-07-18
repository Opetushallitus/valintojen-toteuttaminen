'use client';
import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LaskettuValinnanVaihe } from '@/app/lib/valintalaskenta-service';
import { Typography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getJonoNimi } from './get-jono-nimi';

export const ValintatapajonoAccordionTitle = ({
  valinnanVaihe,
  jono,
}: {
  valinnanVaihe: LaskettuValinnanVaihe;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  const jonoSubHeader = `(${toFormattedDateTimeString(valinnanVaihe.createdAt)} | 
  ${t('yleinen.prioriteetti')}: ${jono.prioriteetti})`;

  return (
    <Typography
      variant="h2"
      component="h3"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        columnGap: 2,
        alignItems: 'center',
      }}
    >
      <Box>
        {getJonoNimi({
          valinnanVaiheNimi: valinnanVaihe.nimi,
          jonoNimi: jono.nimi,
        })}
      </Box>
      <Typography component="div" variant="body1">
        {jonoSubHeader}
      </Typography>
    </Typography>
  );
};
