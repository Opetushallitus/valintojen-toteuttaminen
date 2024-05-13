import HakukohdeTabs from './hakukohde-tabs';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { oid: string; hakukohde: string };
}) {
  return (
    <>
      <div
        className="mainContainer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          width: '100%',
        }}
      >
        <HakukohdeTabs hakukohdeOid={params.hakukohde} />
        {children}
      </div>
    </>
  );
}
