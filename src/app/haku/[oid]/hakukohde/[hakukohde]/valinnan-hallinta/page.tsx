'use client';

import HallintaTable from './components/hallinta-table';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useSuspenseQueries } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';
import { TabContainer } from '../components/tab-container';
import { hakuQueryOptions } from '@/app/hooks/useHaku';
import { hakukohdeQueryOptions } from '@/app/hooks/useHakukohde';
import { haunAsetuksetQueryOptions } from '@/app/hooks/useHaunAsetukset';

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
