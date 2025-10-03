'use client';

import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { PageLayout } from '@/components/page-layout';
import { Header } from '@/components/header';
import { IconHeaderBlock } from '@/components/icon-header-block';

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
