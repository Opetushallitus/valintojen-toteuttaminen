'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box, Stack } from '@mui/material';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import { FullClientSpinner } from '@/components/client-spinner';
import { KoutaOidParams, Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { FormBox } from '@/components/form-box';
import { ValinnanTuloksetTable } from './components/ValinnanTuloksetTable';
import { ValinnanTuloksetSearchControls } from './components/ValinnanTuloksetSearchControls';
import { useValinnanTulosActorRef } from './lib/valinnanTuloksetState';
import { ValinnanTuloksetActions } from '@/components/ValinnanTuloksetActions';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { useValinnanTuloksetSearchParams } from './hooks/useValinnanTuloksetSearch';
import { useIsDirtyValinnanTulos } from '@/lib/state/valinnanTuloksetMachineUtils';
import { useHakemuksetValinnanTuloksilla } from './hooks/useHakemuksetValinnanTuloksilla';
import { ValinnanTuloksetSpinnerModal } from './components/ValinnanTuloksetSpinnerModal';
import {
  queryOptionsGetHakukohteenLukuvuosimaksut,
  queryOptionsGetHakukohteenValinnanTulokset,
} from '@/lib/valinta-tulos-service/valinta-tulos-queries';
import {
  queryOptionsGetHakukohde,
  queryOptionsGetHaku,
} from '@/lib/kouta/kouta-queries';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';
import { useNavigationBlockerWithWindowEvents } from '@/hooks/useNavigationBlocker';
import { Hakemus } from '@/lib/ataru/ataru-types';
import {
  HakukohteenLukuvuosimaksut,
  HakukohteenValinnanTuloksetData,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';

type ValinnanTuloksetContentProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
  lukuvuosimaksut: HakukohteenLukuvuosimaksut;
};

const ValinnanTuloksetContent = ({
  haku,
  hakukohde,
  valinnanTulokset,
  hakemukset,
  lukuvuosimaksut,
}: ValinnanTuloksetContentProps) => {
  const { t } = useTranslations();

  const hakemuksetTuloksilla = useHakemuksetValinnanTuloksilla({
    hakemukset,
    valinnanTulokset,
    lukuvuosimaksut,
  });

  const valinnanTulosActorRef = useValinnanTulosActorRef({
    haku,
    hakukohde,
    hakemukset: hakemuksetTuloksilla,
    lastModified: valinnanTulokset.lastModified,
  });

  const isDirty = useIsDirtyValinnanTulos(valinnanTulosActorRef);
  useNavigationBlockerWithWindowEvents(isDirty);

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

const ValinnanTuloksetPageContent = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
  const [
    { data: haku, dataUpdatedAt: hakuUpdatedAt },
    { data: hakukohde, dataUpdatedAt: hakukohdeUpdatedAt },
    { data: valinnanTulokset, dataUpdatedAt: valinnanTuloksetUpdatedAt },
    { data: hakemukset, dataUpdatedAt: hakemuksetUpdatedAt },
  ] = useSuspenseQueries({
    queries: [
      queryOptionsGetHaku({ hakuOid }),
      queryOptionsGetHakukohde({ hakukohdeOid }),
      queryOptionsGetHakukohteenValinnanTulokset({
        hakuOid,
        hakukohdeOid,
      }),
      queryOptionsGetHakemukset({
        hakuOid,
        hakukohdeOid,
      }),
    ],
  });

  const { data: lukuvuosimaksut, dataUpdatedAt: lukuvuosimaksutUpdatedAt } =
    useSuspenseQuery(
      queryOptionsGetHakukohteenLukuvuosimaksut({ hakukohdeOid, haku }),
    );

  const dataUpdatedAt = Math.max(
    hakuUpdatedAt,
    hakukohdeUpdatedAt,
    valinnanTuloksetUpdatedAt,
    hakemuksetUpdatedAt,
    lukuvuosimaksutUpdatedAt,
  );

  return (
    <ValinnanTuloksetContent
      // Resetoidaan komponentti kun mikä tahansa data päivittyy. Tällä varmistetaan, että tilakone resetoituu kun data muuttuu.
      key={dataUpdatedAt}
      haku={haku}
      hakukohde={hakukohde}
      hakemukset={hakemukset}
      valinnanTulokset={valinnanTulokset}
      lukuvuosimaksut={lukuvuosimaksut}
    />
  );
};

export default function ValinnanTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValinnanTuloksetPageContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
