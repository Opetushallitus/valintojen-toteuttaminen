'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box, CircularProgress } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakijaryhmat } from '@/app/lib/valintalaskenta-service';
import { isEmpty } from '@/app/lib/common';
import { HakijaryhmaContent } from './hakijaryhma-content';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { useHakijaryhmatSearchParams } from '@/app/hooks/useHakijaryhmatSearch';
import { HakijaryhmatControls } from './hakijaryhmat-controls';
import { NoResults } from '@/app/components/no-results';

type HakijaryhmatContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const HakijaryhmatContent = ({
  hakuOid,
  hakukohdeOid,
}: HakijaryhmatContentParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useHakijaryhmatSearchParams();

  const [hakijaryhmatQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakijaryhmat', hakuOid, hakukohdeOid],
        queryFn: () => getHakijaryhmat(hakuOid, hakukohdeOid),
      },
    ],
  });

  if (hakijaryhmatQuery.error) {
    throw hakijaryhmatQuery.error;
  }

  return isEmpty(hakijaryhmatQuery.data) ? (
    <NoResults text={t('hakijaryhmat.ei-tuloksia')} />
  ) : (
    <Box
      display="flex"
      flexDirection="column"
      rowGap={2}
      alignItems="flex-start"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        width="100%"
        gap={2}
      >
        <Box display="flex" alignItems="flex-end" gap={2}>
          <HakijaryhmatControls />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {hakijaryhmatQuery.data.map((hakijaryhma) => (
        <HakijaryhmaContent hakijaryhma={hakijaryhma} key={hakijaryhma.oid} />
      ))}
    </Box>
  );
};

export default function HakijaryhmatPage({
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
        <HakijaryhmatContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
