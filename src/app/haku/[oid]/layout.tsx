import HakukohdeList from './hakukohde-list';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { oid: string };
}) {
  return (
    <main
      className="mainContainer"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <HakukohdeList oid={params.oid} />
      {children}
    </main>
  );
}
