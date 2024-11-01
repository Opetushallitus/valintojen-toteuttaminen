'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';

export default function YhteisvalinnanHallintaPage() {
  const { t } = useTranslations();
  return (
    <Box sx={{ padding: 4 }}>
      TODO: {t('haku-tabs.yhteisvalinnan-hallinta')}
    </Box>
  );
}
