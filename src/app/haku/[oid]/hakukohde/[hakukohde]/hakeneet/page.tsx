'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { TabContainer } from '../TabContainer';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function HakeneetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', params.hakukohde],
    queryFn: () => getHakukohde(params.hakukohde),
  });

  return (
    <TabContainer>
      <h3>Hakeneet</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
