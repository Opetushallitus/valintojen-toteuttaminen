'use client';

import HakukohdeList from './hakukohde-list';

export default function HakuPage({ params }: { params: { oid: string } }) {
  return (
    <main
      className="mainContainer"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <HakukohdeList oid={params.oid} />
      <div style={{ alignSelf: 'center', width: '70%' }}>
        <h2>Valitse hakukohde</h2>
        <p>Kesken...</p>
      </div>
    </main>
  );
}
