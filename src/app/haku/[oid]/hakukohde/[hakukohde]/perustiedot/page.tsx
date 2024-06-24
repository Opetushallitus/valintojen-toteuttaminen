'use client';

import { getSijoittelunTulokset } from '@/app/lib/valinta-tulos-service';
import { TabContainer } from '../tab-container';
import BasicInfo from './basic-info';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ValintatapajonotTable } from './valintatapajonot-table';
import { getHaku } from '@/app/lib/kouta';
import { CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';

type PerustiedotParams = {
  oid: string;
  hakukohde: string;
};

const PerustiedotContent = ({ oid, hakukohde }: PerustiedotParams) => {
  const { t } = useTranslations();

  const [hakuQuery, jonotQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHaku', oid],
        queryFn: () => getHaku(oid),
      },
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
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <PerustiedotContent oid={params.oid} hakukohde={params.hakukohde} />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
