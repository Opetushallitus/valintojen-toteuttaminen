'use client';
import { use } from 'react';

import HallintaTable from './components/hallinta-table';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useSuspenseQueries } from '@tanstack/react-query';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/components/client-spinner';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import {
  queryOptionsGetHakukohde,
  queryOptionsGetHaku,
} from '@/lib/kouta/kouta-queries';
import { queryOptionsGetHaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-queries';

const ValinnanHallintaContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const [hakuQuery, hakukohdeQuery, haunAsetuksetQuery] = useSuspenseQueries({
    queries: [
      queryOptionsGetHaku({ hakuOid }),
      queryOptionsGetHakukohde({ hakukohdeOid }),
      queryOptionsGetHaunAsetukset({ hakuOid }),
    ],
  });

  if (hakuQuery.error && !hakuQuery.isFetching) {
    throw hakuQuery.error;
  }

  if (hakukohdeQuery.error && !hakukohdeQuery.isFetching) {
    throw hakukohdeQuery.error;
  }

  if (haunAsetuksetQuery.error && !haunAsetuksetQuery.isFetching) {
    throw haunAsetuksetQuery.error;
  }

  return (
    <HallintaTable
      hakukohde={hakukohdeQuery.data}
      haku={hakuQuery.data}
      haunAsetukset={haunAsetuksetQuery.data}
    />
  );
};
export default function ValinnanHallintaPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValinnanHallintaContent
          hakukohdeOid={params.hakukohde}
          hakuOid={params.oid}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
