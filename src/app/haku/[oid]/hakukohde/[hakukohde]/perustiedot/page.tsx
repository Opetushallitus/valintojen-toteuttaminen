'use client';

import { getSijoittelunTulokset } from '@/app/lib/valinta-tulos-service';
import { TabContainer } from '../TabContainer';
import BasicInfo from './basic-info';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ValintatapajonotTable } from './valintatapajonot-table';
import { getHaku } from '@/app/lib/kouta';
import { CircularProgress } from '@mui/material';
import { Suspense } from 'react';

export default function PerustiedotTab({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const [hakuQuery, jonotQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHaku', params.oid],
        queryFn: () => getHaku(params.oid),
      },
      {
        queryKey: ['getSijoittelunTulokset', params.oid, params.hakukohde],
        queryFn: () => getSijoittelunTulokset(params.oid, params.hakukohde),
      },
    ],
  });

  return (
    <TabContainer>
      <BasicInfo hakukohdeOid={params.hakukohde} />
      <Suspense fallback={<CircularProgress />}>
        <ValintatapajonotTable
          valintatapajonoTulokset={jonotQuery.data}
          haku={hakuQuery.data}
        />
      </Suspense>
      {(!jonotQuery.data || jonotQuery.data.length < 1) && (
        <span>Ei tulostietoja, sijoittelua ei ole vielä kenties tehty.</span>
      )}
    </TabContainer>
  );
}
