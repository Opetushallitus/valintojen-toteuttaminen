import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { PageLayout } from '@/components/page-layout';
import { Header } from '@/components/header';
import { IconHeaderBlock } from '@/components/icon-header-block';
import { ClientErrorBoundary } from '@/components/client-error-boundary';
import { FullSpinner } from '@/components/full-spinner';
import HakuControls from './components/haku-controls';

export default function HakuListLayout() {
  const { t } = useTranslations();

  return (
    <PageLayout header={<Header isHome={true} title={t('otsikko')} />}>
      <IconHeaderBlock title={t('haku.otsikko')} icon={<AccessTimeIcon />}>
        <ClientErrorBoundary>
          <HakuControls />
          <Suspense fallback={<FullSpinner />}>
            <Outlet />
          </Suspense>
        </ClientErrorBoundary>
      </IconHeaderBlock>
    </PageLayout>
  );
}
