import HakukohdePanel from './hakukohde-panel';
import { MainContainer } from '@/app/components/MainContainer';

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
    <>
      {header}
      <MainContainer
        sx={{ display: 'flex', flexDirection: 'row', textAlign: 'left' }}
      >
        <HakukohdePanel oid={params.oid} />
        {children}
      </MainContainer>
    </>
  );
}
