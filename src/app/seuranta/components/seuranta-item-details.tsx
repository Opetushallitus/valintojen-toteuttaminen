'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';

export const SeurantaItemDetails = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();
  //TODO: näytä valintakoelaskenta ja valinnanvaihe
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 3,
        gridArea: 'details',
      }}
    >
      <Typography variant="body1">{seurantaTiedot.haunnimi}</Typography>
      <Typography variant="body1">{seurantaTiedot.nimi}</Typography>
      <Typography variant="body2">
        {t('seuranta.hakukohteita', {
          total: seurantaTiedot.hakukohteitaYhteensa,
        })}
      </Typography>
    </Box>
  );
};
