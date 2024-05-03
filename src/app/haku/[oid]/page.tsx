'use client';

import { useState } from 'react';
import HakukohdeList from './hakukohde-list';
import HakukohdeTabs from './hakukohde/[oid]/hakukohde-tabs';
import { Hakukohde } from '@/app/lib/kouta-types';

export default function HakuPage({ params }: { params: { oid: string } }) {
  const [selectedHakukohde, setSelectedHakukohde] = useState<Hakukohde | null>(
    null,
  );

  return (
    <main
      className="mainContainer"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <HakukohdeList oid={params.oid} selectFn={setSelectedHakukohde} />
      {selectedHakukohde == null && (
        <div style={{ alignSelf: 'center', width: '70%' }}>
          <h2>Valitse hakukohde</h2>
        </div>
      )}
      {selectedHakukohde && <HakukohdeTabs hakukohde={selectedHakukohde} />}
    </main>
  );
}
