import HakukohdeList from './hakukohde-list';

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
      <main
        className="mainContainer"
        style={{ display: 'flex', flexDirection: 'row' }}
      >
        <HakukohdeList oid={params.oid} />
        {children}
      </main>
    </>
  );
}