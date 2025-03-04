'use client';
import { use } from 'react';

import HallintaTable from './components/hallinta-table';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { useSuspenseQueries } from '@tanstack/react-query';
import { TabContainer } from '../components/tab-container';
import { hakuQueryOptions } from '@/app/lib/kouta/useHaku';
import { hakukohdeQueryOptions } from '@/app/lib/kouta/useHakukohde';
import { haunAsetuksetQueryOptions } from '@/app/lib/ohjausparametrit/useHaunAsetukset';
import { FullClientSpinner } from '@/app/components/client-spinner';

type ValinnanHallintaContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const ValinnanHallintaContent = ({
  hakuOid,
  hakukohdeOid,
}: ValinnanHallintaContentParams) => {
  const [hakuQuery, hakukohdeQuery, haunAsetuksetQuery] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid }),
      hakukohdeQueryOptions({ hakukohdeOid }),
      haunAsetuksetQueryOptions({ hakuOid }),
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
