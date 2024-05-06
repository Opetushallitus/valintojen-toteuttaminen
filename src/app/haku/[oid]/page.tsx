'use client';

import { useState } from 'react';
import HakukohdeList from './hakukohde-list';
import HakukohdeTabs from './hakukohde/[hakukohde]/hakukohde-tabs';
import { Hakukohde } from '@/app/lib/kouta-types';

export default function HakuPage({ params }: { params: { oid: string } }) {
  const [selectedHakukohde, setSelectedHakukohde] = useState<Hakukohde | null>(
    null,
  );

  const selectHakukohde = (hakukohde: Hakukohde) => {
    setSelectedHakukohde(hakukohde);
    history.pushState(null, '', `${params.oid}/hakukohde/${hakukohde.oid}`);
  };

  return (
    <main
      className="mainContainer"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <HakukohdeList oid={params.oid} selectFn={selectHakukohde} />
      {selectedHakukohde == null && (
        <div style={{ alignSelf: 'center', width: '70%' }}>
          <h2>Valitse hakukohde</h2>
        </div>
      )}
      {selectedHakukohde && <HakukohdeTabs hakukohde={selectedHakukohde} />}
    </main>
  );
}
