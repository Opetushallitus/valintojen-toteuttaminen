'use client';

import { CalculateOutlined } from '@mui/icons-material';
import { PageLayout } from '@/components/page-layout';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Header } from '@/components/header';
import { IconHeaderBlock } from '@/components/icon-header-block';

export default function SeurantaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslations();

  return (
    <PageLayout header={<Header isHome={true} title={t('seuranta.otsikko')} />}>
      <IconHeaderBlock
        title={t('seuranta.laskennat-otsikko')}
        icon={<CalculateOutlined />}
      >
        {children}
      </IconHeaderBlock>
    </PageLayout>
  );
}
