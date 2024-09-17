'use client';

import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getScoresForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { PisteSyottoControls } from './pistesyotto-controls';
import { Box } from '@mui/material';
import { PisteSyottoForm } from './pistesyotto-form';
import { useTranslations } from '@/app/hooks/useTranslations';
import { isEmpty } from '@/app/lib/common';
import { NoResults } from '@/app/components/no-results';

type PisteSyottoContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const PisteSyottoContent = ({
  hakuOid,
  hakukohdeOid,
}: PisteSyottoContentParams) => {
  const { t } = useTranslations();

  const { data: pistetulokset } = useSuspenseQuery({
    queryKey: ['getScoresForHakukohde', hakukohdeOid],
    queryFn: () => getScoresForHakukohde(hakuOid, hakukohdeOid),
  });

  return isEmpty(pistetulokset.valintakokeet) ? (
    <NoResults text={t('pistesyotto.ei-tuloksia')} />
  ) : (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <PisteSyottoControls kokeet={pistetulokset.valintakokeet} />
      <PisteSyottoForm
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        pistetulokset={pistetulokset}
      />
    </Box>
  );
};

export default function PisteSyottoPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <PisteSyottoContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
