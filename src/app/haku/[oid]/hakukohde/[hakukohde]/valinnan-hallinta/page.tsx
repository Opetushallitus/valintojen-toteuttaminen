'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { TabContainer } from '../TabContainer';

export default function ValinnanHallintaPage({
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
      <h3>Valinnan hallinta</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
