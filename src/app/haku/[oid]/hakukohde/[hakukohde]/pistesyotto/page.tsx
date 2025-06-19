'use client';
import { use, useMemo } from 'react';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { PisteSyottoControls } from './components/pistesyotto-controls';
import { Box } from '@mui/material';
import { PisteSyottoForm } from './components/pistesyotto-form';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { augmentPisteetWithHakemukset } from './lib/pistesyotto-utils';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { queryOptionsGetPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';

const PisteSyottoContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const [{ data: pistetulokset }, { data: hakemukset }] = useSuspenseQueries({
    queries: [
      queryOptionsGetPisteetForHakukohde({
        hakuOid,
        hakukohdeOid,
      }),
      queryOptionsGetHakemukset({
        hakuOid,
        hakukohdeOid,
      }),
    ],
  });

  const pistetiedot: HakukohteenPistetiedot = useMemo(() => {
    return {
      lastModified: pistetulokset?.lastModified,
      valintakokeet: pistetulokset?.valintakokeet ?? [],
      hakemustenPistetiedot: augmentPisteetWithHakemukset(
        hakemukset,
        pistetulokset.valintapisteet,
      ),
    };
  }, [pistetulokset, hakemukset]);

  return isEmpty(pistetiedot.valintakokeet) ? (
    <NoResults text={t('pistesyotto.ei-tuloksia')} />
  ) : (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <PisteSyottoControls kokeet={pistetiedot.valintakokeet} />
      <PisteSyottoForm
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        pistetiedot={pistetiedot}
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
    queryOptionsGetPisteetForHakukohde({
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
