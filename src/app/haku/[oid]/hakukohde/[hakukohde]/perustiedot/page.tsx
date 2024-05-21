'use client';

import { TabContainer } from '../TabContainer';
import BasicInfo from './basic-info';

export default function PerustiedotTab({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <BasicInfo hakukohdeOid={params.hakukohde} />
    </TabContainer>
  );
}
