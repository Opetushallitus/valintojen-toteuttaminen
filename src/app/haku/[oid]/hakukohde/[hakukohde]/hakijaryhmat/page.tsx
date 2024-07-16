'use client';

import { TabContainer } from '../tab-container';
import { useHakukohde } from '@/app/hooks/useHakukohde';

export default function HakijaryhmatPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useHakukohde({ hakukohdeOid: params.hakukohde });

  return (
    <TabContainer>
      <h3>Hakijaryhmät</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
