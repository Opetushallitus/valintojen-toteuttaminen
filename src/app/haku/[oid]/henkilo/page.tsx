'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';

export default function HenkiloPage() {
  const { t } = useTranslations();
  return <Box sx={{ padding: 4 }}>TODO: {t('haku-tabs.henkilo')}</Box>;
}
