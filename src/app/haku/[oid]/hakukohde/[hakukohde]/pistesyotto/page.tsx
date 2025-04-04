'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { PisteSyottoControls } from './components/pistesyotto-controls';
import { Box } from '@mui/material';
import { PisteSyottoForm } from './components/pistesyotto-form';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import {
  pisteTuloksetOptions,
  usePisteTulokset,
} from './hooks/usePisteTulokset';
import { useQueryClient } from '@tanstack/react-query';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const PisteSyottoContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const { data: pistetulokset } = usePisteTulokset({ hakuOid, hakukohdeOid });

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

export default function PisteSyottoPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(
    pisteTuloksetOptions({
      hakuOid: params.oid,
      hakukohdeOid: params.hakukohde,
    }),
  );
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <PisteSyottoContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
