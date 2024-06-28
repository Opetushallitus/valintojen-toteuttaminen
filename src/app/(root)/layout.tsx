'use client';

import Header from '../components/header';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, Typography } from '@mui/material';
import { PageLayout } from '../components/page-layout';
import { colors } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER } from '../lib/constants';

const IconHeaderBlock = ({
  title,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Box
      component="main"
      sx={{
        backgroundColor: colors.white,
      }}
    >
      <Typography
        component="div"
        variant="h2"
        sx={{
          border: DEFAULT_BOX_BORDER,
          borderBottom: 'none',
          paddingX: 4,
          paddingY: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AccessTimeIcon /> {title}
      </Typography>
      <Box
        sx={{
          border: DEFAULT_BOX_BORDER,
          paddingX: 4,
          paddingY: 2,
        }}
      >
        {children}
      </Box>
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
