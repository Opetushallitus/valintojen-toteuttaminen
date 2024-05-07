'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';
import { TabContainer } from '../TabContainer';

export default function PerustiedotTab({
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
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
