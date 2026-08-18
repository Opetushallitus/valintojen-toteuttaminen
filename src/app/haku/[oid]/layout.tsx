import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { PageLayout } from '@/components/page-layout';
import { HakuTabs } from './components/haku-tabs';
import { Stack } from '@mui/material';
import { ClientErrorBoundary } from '@/components/client-error-boundary';
import { ClientSpinner } from '@/components/client-spinner';
import { Header } from '@/components/header';
import { HakuHeader } from './components/haku-header';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function HakuLayout() {
  const { oid } = useRequiredParams<{ oid: string }>();

  return (
    <PageLayout
      header={
        <Suspense fallback={<Header title={<ClientSpinner />} isHome={true} />}>
          <HakuHeader />
        </Suspense>
      }
    >
      <Stack
        component="main"
        sx={{
          alignItems: 'stretch',
        }}
      >
        <ClientErrorBoundary>
          <HakuTabs hakuOid={oid} />
          <Outlet />
        </ClientErrorBoundary>
      </Stack>
    </PageLayout>
  );
}
