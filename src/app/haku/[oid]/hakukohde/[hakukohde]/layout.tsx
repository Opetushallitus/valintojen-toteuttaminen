import HakukohdeTabs from './hakukohde-tabs';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: { oid: string; hakukohde: string };
}) {
  return (
    <>
      <main
        className="mainContainer"
        style={{ display: 'flex', flexDirection: 'row' }}
      >
        <HakukohdeTabs hakukohdeOid={params.hakukohde} />
        {children}
      </main>
    </>
  );
}
