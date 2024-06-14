'use client';

import { TabContainer } from '../TabContainer';
import HallintaTable from './hallinta-table';

export default function ValinnanHallintaPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <HallintaTable hakukohdeOid={params.hakukohde} />
    </TabContainer>
  );
}
