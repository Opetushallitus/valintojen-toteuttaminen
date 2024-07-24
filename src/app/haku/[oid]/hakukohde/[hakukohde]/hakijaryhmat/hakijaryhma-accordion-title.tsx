'use client';
import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakukohteenHakijaryhma } from '@/app/lib/valintalaskenta-service';
import { Typography } from '@opetushallitus/oph-design-system';
import React from 'react';
import theme from '@/app/theme';

export const HakijaryhmaAccordionTitle = ({
  hakijaryhma,
}: {
  hakijaryhma: HakukohteenHakijaryhma;
}) => {
  const { t } = useTranslations();

  return (
    <Typography
      variant="h2"
      component="h3"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        columnGap: theme.spacing(1),
        alignItems: 'center',
      }}
    >
      <Box>{hakijaryhma.nimi}</Box>
      <Typography component="div" variant="body1">
        {t('hakijaryhmat.kiintio', { kiintio: hakijaryhma.kiintio })}
      </Typography>
    </Typography>
  );
};
