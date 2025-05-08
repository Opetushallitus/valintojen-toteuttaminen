'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box, Stack } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakukohteenValinnanTuloksetQueryOptions } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import { FullClientSpinner } from '@/components/client-spinner';
import { getHakemuksetQueryOptions } from '@/lib/ataru/ataru-service';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { FormBox } from '@/components/form-box';
import { ValinnanTuloksetTable } from './components/ValinnanTuloksetTable';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';
import { hakukohdeQueryOptions } from '@/lib/kouta/useHakukohde';
import { ValinnanTuloksetSearchControls } from './components/ValinnanTuloksetSearchControls';
import { useValinnanTulosActorRef } from './lib/valinnanTuloksetState';
import { ValinnanTuloksetActions } from '@/components/ValinnanTuloksetActions';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { useValinnanTuloksetSearchParams } from './hooks/useValinnanTuloksetSearch';
import { useIsDirtyValinnanTulos } from '@/lib/state/valinnanTuloksetMachineUtils';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { useHakemuksetValinnanTuloksilla } from './hooks/useHakemuksetValinnanTuloksilla';
import { ValinnanTuloksetSpinnerModal } from './components/ValinnanTuloksetSpinnerModal';

const ValinnanTuloksetContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const [
    { data: haku },
    { data: hakukohde },
    { data: valinnanTulokset },
    { data: hakemukset },
  ] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid }),
      hakukohdeQueryOptions({ hakukohdeOid }),
      getHakukohteenValinnanTuloksetQueryOptions({
        hakuOid,
        hakukohdeOid,
      }),
      getHakemuksetQueryOptions({
        hakuOid,
        hakukohdeOid,
      }),
    ],
  });

  const hakemuksetTuloksilla = useHakemuksetValinnanTuloksilla({
    hakemukset,
    valinnanTulokset,
  });

  const valinnanTulosActorRef = useValinnanTulosActorRef({
    haku,
    hakukohde,
    hakemukset: hakemuksetTuloksilla,
    lastModified: valinnanTulokset.lastModified,
  });

  const isDirty = useIsDirtyValinnanTulos(valinnanTulosActorRef);
  useConfirmChangesBeforeNavigation(isDirty);

  const { pageSize, setPageSize } = useValinnanTuloksetSearchParams();

  return isEmpty(hakemuksetTuloksilla) ? (
    <NoResults text={t('valinnan-tulokset.ei-hakemuksia')} />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        alignItems: 'flex-start',
      }}
    >
      <ValinnanTuloksetSpinnerModal actorRef={valinnanTulosActorRef} />
      <Stack
        flexDirection="row"
        gap={2}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <ValinnanTuloksetSearchControls />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Stack>
      <FormBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ValinnanTuloksetActions
          haku={haku}
          hakukohde={hakukohde}
          valinnanTulosActorRef={valinnanTulosActorRef}
          mode="valinta"
        />
        <ValinnanTuloksetTable
          haku={haku}
          hakukohde={hakukohde}
          actorRef={valinnanTulosActorRef}
        />
      </FormBox>
    </Box>
  );
};

export default function ValinnanTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValinnanTuloksetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
