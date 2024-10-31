import { MainContainer } from '@/app/components/main-container';
import { PageLayout } from '@/app/components/page-layout';
import { HakuTabs } from './components/haku-tabs';

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
        {children}
      </MainContainer>
    </PageLayout>
  );
}
