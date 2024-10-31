'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { styled } from '@/app/lib/theme';
import { Box, Link, Stack } from '@mui/material';

const TabLink = styled(Link)(({ theme }) => ({
  padding: theme.spacing(0),
}));

export const HakuTabs = () => {
  const { t } = useTranslations();

  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        gap: 4,
        padding: 2,
        borderBottom: DEFAULT_BOX_BORDER,
      }}
    >
      <TabLink href="#">{t('haku-tabs.hakukohteittain')}</TabLink>
      <TabLink href="#">{t('haku-tabs.henkiloittain')}</TabLink>
      <TabLink href="#">{t('haku-tabs.valintaryhmittain')}</TabLink>
      <Box sx={{ flexGrow: 2 }}></Box>
      <TabLink href="#">{t('haku-tabs.yhteisvalinnan-hallinta')}</TabLink>
    </Stack>
  );
};
