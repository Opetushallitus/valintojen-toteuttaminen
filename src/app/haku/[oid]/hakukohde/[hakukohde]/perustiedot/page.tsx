'use client';
import { use } from 'react';

import { getSijoittelunTulokset } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { TabContainer } from '../components/tab-container';
import BasicInfo from './components/basic-info';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ValintatapajonotTable } from './components/valintatapajonot-table';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';

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

export default function PerustiedotTab(props: {
  params: Promise<PerustiedotParams>;
}) {
  const params = use(props.params);
  const { t } = useTranslations();

  return (
    <TabContainer>
      <BasicInfo hakukohdeOid={params.hakukohde} />
      <h3>{t('perustiedot.taulukko.otsikko')}</h3>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <PerustiedotContent oid={params.oid} hakukohde={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
