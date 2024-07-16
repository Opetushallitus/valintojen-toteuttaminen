'use client';
import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  LaskettuJonoWithHakijaInfot,
  LaskettuValinnanVaihe,
} from '@/app/lib/valintalaskenta-service';
import { Typography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';

const getJonoNimi = ({
  valinnanVaiheNimi,
  jonoNimi,
}: {
  valinnanVaiheNimi: string;
  jonoNimi: string;
}) => {
  return jonoNimi.includes(valinnanVaiheNimi)
    ? jonoNimi
    : `${valinnanVaiheNimi}: ${jonoNimi}`;
};

export const ValintatapajonoAccordionTitle = ({
  valinnanVaihe,
  jono,
}: {
  valinnanVaihe: LaskettuValinnanVaihe;
  jono: LaskettuJonoWithHakijaInfot;
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
