import HakukohdeTabs from './components/hakukohde-tabs';
import { MainContainer } from '@/app/components/main-container';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { oid: string; hakukohde: string };
}) {
  return (
    <MainContainer
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        width: '100%',
      }}
    >
      <HakukohdeTabs hakuOid={params.oid} hakukohdeOid={params.hakukohde} />
      {children}
    </MainContainer>
  );
}
