'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { SijoitteluContainer } from './sijoittelu/components/sijoittelu-container';

export default function YhteisvalinnanHallintaPage() {
  const { t } = useTranslations();
  return (
    <Box sx={{ padding: 4 }}>
      TODO: {t('haku-tabs.yhteisvalinnan-hallinta')}
      <SijoitteluContainer />
    </Box>
  );
}
