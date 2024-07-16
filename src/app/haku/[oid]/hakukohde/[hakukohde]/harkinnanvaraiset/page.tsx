'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { TabContainer } from '../tab-container';

export default function HarkinnanvaraisetPage({
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
      <h3>Harkinnanvaraiset</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
