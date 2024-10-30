'use client';

import { getSijoittelunTulokset } from '@/app/lib/valinta-tulos-service';
import { TabContainer } from '../components/tab-container';
import BasicInfo from './components/basic-info';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ValintatapajonotTable } from './components/valintatapajonot-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import { hakuQueryOptions } from '@/app/hooks/useHaku';

type PerustiedotParams = {
  oid: string;
  hakukohde: string;
};

const PerustiedotContent = ({ oid, hakukohde }: PerustiedotParams) => {
  const { t } = useTranslations();

  const [hakuQuery, jonotQuery] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid: oid }),
      {
        queryKey: ['getSijoittelunTulokset', oid, hakukohde],
        queryFn: () => getSijoittelunTulokset(oid, hakukohde),
      },
    ],
  });

  if (hakuQuery.error && !hakuQuery.isFetching) {
    throw hakuQuery.error;
  }

  if (jonotQuery.error && !jonotQuery.isFetching) {
    throw jonotQuery.error;
  }

  return jonotQuery.data.length > 0 ? (
    <ValintatapajonotTable
      valintatapajonoTulokset={jonotQuery.data}
      haku={hakuQuery.data}
    />
  ) : (
    <span>{t('perustiedot.taulukko.eiosumia')}</span>
  );
};

export default function PerustiedotTab({
  params,
}: {
  params: PerustiedotParams;
}) {
  const { t } = useTranslations();

  return (
    <TabContainer>
      <BasicInfo hakukohdeOid={params.hakukohde} />
      <h3>{t('perustiedot.taulukko.otsikko')}</h3>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <PerustiedotContent oid={params.oid} hakukohde={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
