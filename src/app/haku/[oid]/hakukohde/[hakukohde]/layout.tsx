import HakukohdeTabs from './hakukohde-tabs';
import { MainContainer } from '@/app/components/MainContainer';

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
      <HakukohdeTabs hakukohdeOid={params.hakukohde} />
      {children}
    </MainContainer>
  );
}
