import { useMemo } from 'react';
import { ClientLoaderFunctionArgs } from 'react-router';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { PisteSyottoControls } from './components/pistesyotto-controls';
import { Box } from '@mui/material';
import { PisteSyottoForm } from './components/pistesyotto-form';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import { useSuspenseQueries } from '@tanstack/react-query';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { augmentPisteetWithHakemukset } from './lib/pistesyotto-utils';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { queryOptionsGetPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { queryClient } from '@/components/providers/react-query-client-provider';

const PisteSyottoContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const [
    { data: pistetulokset, dataUpdatedAt: pisteTuloksetUpdatedAt },
    { data: hakemukset, dataUpdatedAt: hakemuksetUpdatedAt },
  ] = useSuspenseQueries({
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

  const pistetiedot: HakukohteenPistetiedot = useMemo(
    () => ({
      lastModified: pistetulokset?.lastModified,
      valintakokeet: pistetulokset?.valintakokeet ?? [],
      hakemustenPistetiedot: augmentPisteetWithHakemukset(
        hakemukset,
        pistetulokset.valintapisteet,
      ),
    }),
    [
      pistetulokset.lastModified, // FIXME: Tämä näyttäisi palautuvan rajapinnasta aina nullina
      pistetulokset.valintakokeet,
      pistetulokset.valintapisteet,
      hakemukset,
    ],
  );

  // lastModified olisi parempi, mutta koska se on aina null, käytetään tätä
  const updatedAt = Math.max(pisteTuloksetUpdatedAt, hakemuksetUpdatedAt);

  return isEmpty(pistetiedot.valintakokeet) ? (
    <NoResults text={t('pistesyotto.ei-tuloksia')} />
  ) : (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <PisteSyottoControls kokeet={pistetiedot.valintakokeet} />
      <PisteSyottoForm
        // Resetoidaan komponentti kun mikä tahansa data päivittyy. Tällä varmistetaan, että tilakone resetoituu kun data muuttuu.
        key={`${hakukohdeOid}_${updatedAt}`}
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        pistetiedot={pistetiedot}
      />
    </Box>
  );
};

export const clientLoader = ({ params }: ClientLoaderFunctionArgs) => {
  const { oid, hakukohde } = params as { oid: string; hakukohde: string };
  queryClient.prefetchQuery(
    queryOptionsGetPisteetForHakukohde({
      hakuOid: oid,
      hakukohdeOid: hakukohde,
    }),
  );
};

export default function PisteSyottoPage() {
  const params = useRequiredParams<{ oid: string; hakukohde: string }>();
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
