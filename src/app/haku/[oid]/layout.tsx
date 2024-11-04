import { PageLayout } from '@/app/components/page-layout';
import { HakuTabs } from './components/haku-tabs';
import { Stack } from '@mui/material';

export default function HakuLayout({
  children,
  header,
  params,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: { oid: string };
}) {
  return (
    <PageLayout header={header}>
      <Stack
        component="main"
        sx={{
          alignItems: 'stretch',
        }}
      >
        <HakuTabs hakuOid={params.oid} />
        {children}
      </Stack>
    </PageLayout>
  );
}
