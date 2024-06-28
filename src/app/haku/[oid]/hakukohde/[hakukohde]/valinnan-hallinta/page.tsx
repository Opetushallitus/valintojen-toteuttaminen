'use client';

import { useHakukohde } from '@/app/hooks/useHakukohde';
import { TabContainer } from '../tab-container';

export default function ValinnanHallintaPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useHakukohde({ hakukohdeOid: params.hakukohde });

  return (
    <TabContainer>
      <h3>Valinnan hallinta</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
