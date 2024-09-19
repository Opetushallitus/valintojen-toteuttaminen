'use client';

import { getHaku, getHakukohde } from '@/app/lib/kouta';
import HallintaTable from './components/hallinta-table';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useSuspenseQueries } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';
import { getHaunAsetukset } from '@/app/lib/ohjausparametrit';
import { TabContainer } from '../tab-container';

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
      {
        queryKey: ['getHaku', hakuOid],
        queryFn: () => getHaku(hakuOid),
      },
      {
        queryKey: ['getHakukohde', hakukohdeOid],
        queryFn: () => getHakukohde(hakukohdeOid),
      },
      {
        queryKey: ['getHaunAsetukset', hakuOid],
        queryFn: () => getHaunAsetukset(hakuOid),
      },
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
export default function ValinnanHallintaPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { t } = useTranslations();

  return (
    <TabContainer>
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <ValinnanHallintaContent
          hakukohdeOid={params.hakukohde}
          hakuOid={params.oid}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
