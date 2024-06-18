'use client';

import { getHaku, getHakukohde } from '@/app/lib/kouta';
import { TabContainer } from '../TabContainer';
import HallintaTable from './hallinta-table';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useSuspenseQueries } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';

type ValinnanHallintaContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const ValinnanHallintaContent = ({
  hakuOid,
  hakukohdeOid,
}: ValinnanHallintaContentParams) => {
  const [hakuQuery, hakukohdeQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHaku', hakuOid],
        queryFn: () => getHaku(hakuOid),
      },
      {
        queryKey: ['getHakukohde', hakukohdeOid],
        queryFn: () => getHakukohde(hakukohdeOid),
      },
    ],
  });

  if (hakuQuery.error && !hakuQuery.isFetching) {
    throw hakuQuery.error;
  }

  if (hakukohdeQuery.error && !hakukohdeQuery.isFetching) {
    throw hakukohdeQuery.error;
  }

  return (
    <HallintaTable hakukohde={hakukohdeQuery.data} haku={hakuQuery.data} />
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
