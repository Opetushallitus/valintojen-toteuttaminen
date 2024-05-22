'use client';

import { getSijoittelunTulokset } from '@/app/lib/valinta-tulos-service';
import { TabContainer } from '../TabContainer';
import BasicInfo from './basic-info';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ValintatapajonotTable } from './valintatapajonot-table';

export default function PerustiedotTab({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: valintatapajonot } = useSuspenseQuery({
    queryKey: ['getSijoittelunTulokset', params.oid, params.hakukohde],
    queryFn: () => getSijoittelunTulokset(params.oid, params.hakukohde),
  });

  return (
    <TabContainer>
      <BasicInfo hakukohdeOid={params.hakukohde} />
      <ValintatapajonotTable valintatapajonoTulokset={valintatapajonot} />
    </TabContainer>
  );
}
