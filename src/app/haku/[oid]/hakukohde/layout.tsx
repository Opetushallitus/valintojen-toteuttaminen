import { MainContainer } from '@/app/components/main-container';
import { PageLayout } from '@/app/components/page-layout';
import { Stack } from '@mui/material';
import { HakuTabs } from './components/haku-tabs';
import HakukohdePanel from './components/hakukohde-panel';

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
      <MainContainer
        sx={{ flexDirection: 'column', padding: 0, alignItems: 'stretch' }}
      >
        <HakuTabs hakuOid={params.oid} />
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
          }}
        >
          <HakukohdePanel hakuOid={params.oid} />
          {children}
        </Stack>
      </MainContainer>
    </PageLayout>
  );
}
