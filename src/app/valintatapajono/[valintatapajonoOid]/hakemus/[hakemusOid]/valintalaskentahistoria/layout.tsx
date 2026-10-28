import { Outlet } from 'react-router';
import { PageLayout } from '@/components/page-layout';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Header } from '@/components/header';
import { Box, useTheme } from '@mui/material';
import { responsivePadding } from '@/lib/responsive-padding';

export default function ValintalaskentahistoriaLayout() {
  const { t } = useTranslations();

  const theme = useTheme();

  return (
    <PageLayout
      header={
        <Header isHome={true} title={t('valintalaskentahistoria.otsikko')} />
      }
    >
      <Box component="main" sx={responsivePadding(theme)}>
        <Outlet />
      </Box>
    </PageLayout>
  );
}
