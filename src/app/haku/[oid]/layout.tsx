import { PageLayout } from '@/components/page-layout';
import { HakuTabs } from './components/haku-tabs';
import { Stack } from '@mui/material';
import { ClientErrorBoundary } from '@/components/client-error-boundary';

export default async function HakuLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children, header } = props;

  return (
    <PageLayout header={header}>
      <Stack
        component="main"
        sx={{
          alignItems: 'stretch',
        }}
      >
        <ClientErrorBoundary>
          <HakuTabs hakuOid={params.oid} />
          {children}
        </ClientErrorBoundary>
      </Stack>
    </PageLayout>
  );
}
