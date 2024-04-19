'use client';

import { FullSpinner } from '@/app/components/full-spinner';
import Header from '@/app/components/header';
import { getTranslation } from '@/app/lib/common';
import { getHaku } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

const HakukohdeList = dynamic(() => import('./hakukohde-list'), {
  loading: () => <FullSpinner />,
});

export default function HakuPage({ params }: { params: { oid: string } }) {
  const { data: hakuNimi } = useSuspenseQuery({
    queryKey: ['getHaku', params.oid],
    queryFn: () => getHaku(params.oid),
  });

  return (
    <>
      <Header title={getTranslation(hakuNimi)} />
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
    </>
  );
}
