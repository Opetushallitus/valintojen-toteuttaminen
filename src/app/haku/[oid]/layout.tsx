import { PageLayout } from '@/components/page-layout';
import { HakuTabs } from './components/haku-tabs';
import { Stack } from '@mui/material';

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
        <HakuTabs hakuOid={params.oid} />
        {children}
      </Stack>
    </PageLayout>
  );
}
