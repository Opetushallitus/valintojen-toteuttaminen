import HakukohdePanel from './components/hakukohde-panel';
import { MainContainer } from '@/app/components/main-container';
import { PageLayout } from '@/app/components/page-layout';

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
        sx={{
          display: 'flex',
          flexDirection: 'row',
          textAlign: 'left',
          alignItems: 'flex-start',
        }}
      >
        <HakukohdePanel hakuOid={params.oid} />
        {children}
      </MainContainer>
    </PageLayout>
  );
}
