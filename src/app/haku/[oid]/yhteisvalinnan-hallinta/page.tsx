'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { SijoitteluContainer } from './sijoittelu/components/sijoittelu-container';
import { use } from 'react';

export default function YhteisvalinnanHallintaPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);
  const { t } = useTranslations();
  return (
    <Box sx={{ padding: 4 }}>
      TODO: {t('haku-tabs.yhteisvalinnan-hallinta')}
      <SijoitteluContainer hakuOid={params.oid} />
    </Box>
  );
}
