'use client';

import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getScoresForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { PisteSyottoControls } from './pistesyotto-controls';
import { Box } from '@mui/material';
import { PisteSyottoForm } from './pistesyotto-form';
import { IconCircle } from '@/app/components/icon-circle';
import { FolderOutlined } from '@mui/icons-material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { isEmpty } from '@/app/lib/common';

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
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <IconCircle>
        <FolderOutlined />
      </IconCircle>
      <Box>{t('pistesyotto.ei-tuloksia')}</Box>
    </Box>
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
