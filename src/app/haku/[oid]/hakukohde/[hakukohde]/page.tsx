'use client';

import HakukohdeTabs from './hakukohde-tabs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '@/app/lib/kouta';

export default function HakukohdePage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', params.hakukohde],
    queryFn: () => getHakukohde(params.hakukohde),
  });

  return (
    <main
      className="mainContainer"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      {hakukohde && <HakukohdeTabs hakukohde={hakukohde} />}
    </main>
  );
}
