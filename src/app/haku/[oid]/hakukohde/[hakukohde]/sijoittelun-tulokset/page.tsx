'use client';

import { useHakukohde } from '@/app/hooks/useHakukohde';
import { TabContainer } from '../tab-container';

export default function SijoittelunTuloksetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useHakukohde({ hakukohdeOid: params.hakukohde });

  return (
    <TabContainer>
      <h3>Sijoittelun tulokset</h3>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </TabContainer>
  );
}
