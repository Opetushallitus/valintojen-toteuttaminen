'use client';

import { getSijoittelunTulokset } from '@/app/lib/valinta-tulos-service';
import { TabContainer } from '../TabContainer';
import BasicInfo from './basic-info';
import { useQueries } from '@tanstack/react-query';
import { ValintatapajonotTable } from './valintatapajonot-table';
import { getHaku } from '@/app/lib/kouta';
import { CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export default function PerustiedotTab({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { t } = useTranslations();

  const [hakuQuery, jonotQuery] = useQueries({
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
      <h3>{t('perustiedot.taulukko.otsikko')}</h3>
      {hakuQuery.isLoading ||
        (jonotQuery.isLoading && (
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        ))}
      {!(hakuQuery.isLoading || jonotQuery.isLoading) &&
        jonotQuery.data &&
        jonotQuery.data.length > 0 &&
        hakuQuery.data && (
          <ValintatapajonotTable
            valintatapajonoTulokset={jonotQuery.data}
            haku={hakuQuery.data}
          />
        )}
      {!(hakuQuery.isLoading || jonotQuery.isLoading) &&
        (!jonotQuery.data || jonotQuery.data.length < 1) && (
          <span>{t('perustiedot.taulukko.eiosumia')}</span>
        )}
    </TabContainer>
  );
}
