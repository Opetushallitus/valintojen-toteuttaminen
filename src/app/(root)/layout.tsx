'use client';

import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Typography } from '@mui/material';
import { PageLayout } from '@/components/page-layout';
import { Header } from '@/components/header';
import { responsivePadding } from '@/lib/responsive-padding';
import { DEFAULT_BOX_BORDER } from '@/lib/theme';

const IconHeaderBlock = ({
  title,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Box component="main">
      <Box
        sx={(theme) => ({
          borderBottom: DEFAULT_BOX_BORDER,
          display: 'flex',
          alignItems: 'center',
          columnGap: 1,
          ...responsivePadding(theme),
        })}
      >
        <AccessTimeIcon />
        <Typography variant="h2">{title}</Typography>
      </Box>
      <Box sx={(theme) => responsivePadding(theme)}>{children}</Box>
    </Box>
  );
};

export default function HakuListLayout({
  children,
  controls,
}: {
  children: React.ReactNode;
  controls: React.ReactNode;
}) {
  const { t } = useTranslations();

  return (
    <PageLayout header={<Header isHome={true} title={t('otsikko')} />}>
      <IconHeaderBlock title={t('haku.otsikko')} icon={<AccessTimeIcon />}>
        {controls}
        {children}
      </IconHeaderBlock>
    </PageLayout>
  );
}
