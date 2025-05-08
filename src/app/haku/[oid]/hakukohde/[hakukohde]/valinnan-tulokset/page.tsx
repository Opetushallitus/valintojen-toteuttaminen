'use client';
import { use, useCallback } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import {
  QueryClient,
  useQueryClient,
  useSuspenseQueries,
} from '@tanstack/react-query';
import {
  getHakukohteenValinnanTuloksetQueryOptions,
  HakukohteenValinnanTuloksetData,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isEmpty } from '@/lib/common';
import { NoResults } from '@/components/no-results';
import { FullClientSpinner } from '@/components/client-spinner';
import { getHakemuksetQueryOptions } from '@/lib/ataru/ataru-service';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { Hakemus } from '@/lib/ataru/ataru-types';
import { FormBox } from '@/components/form-box';
import { ValinnanTuloksetTable } from './components/valinnan-tulokset-table';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';
import { hakukohdeQueryOptions } from '@/lib/kouta/useHakukohde';
import { ValinnanTuloksetSearchControls } from './components/valinnan-tulokset-search-controls';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useValinnanTulosActorRef } from './lib/valinnan-tulos-state';
import { ValinnanTulosActions } from '@/components/valinnan-tulos-actions';

const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
}): Array<HakemuksenValinnanTulos> => {
  return hakemukset.map((hakemus) => {
    const valinnanTulos = valinnanTulokset.data[hakemus.hakemusOid] ?? {};
    return {
      hakijaOid: hakemus.hakijaOid,
      hakemusOid: hakemus.hakemusOid,
      hakijanNimi: hakemus.hakijanNimi,
      hakukohdeOid: valinnanTulos.hakukohdeOid,
      valintatapajonoOid: valinnanTulos.valintatapajonoOid,
      valinnanTila: valinnanTulos.valinnantila,
      vastaanottoTila: valinnanTulos.vastaanottotila,
      ilmoittautumisTila: valinnanTulos.ilmoittautumistila,
      ehdollisestiHyvaksyttavissa: valinnanTulos.ehdollisestiHyvaksyttavissa,
      ehdollisenHyvaksymisenEhtoKoodi:
        valinnanTulos.ehdollisenHyvaksymisenEhtoKoodi,
      ehcollisenHyvaksymisenEhtoFI: valinnanTulos.ehdollisenHyvaksymisenEhtoFI,
      ehdollisenHyvaksymisenEhtoSV: valinnanTulos.ehdollisenHyvaksymisenEhtoSV,
      ehdollisenHyvaksymisenEhtoEN: valinnanTulos.ehdollisenHyvaksymisenEhtoEN,
      valinnanTilanKuvausFI: valinnanTulos.valinnantilanKuvauksenTekstiFI,
      valinnanTilanKuvausSV: valinnanTulos.valinnantilanKuvauksenTekstiSV,
      valinnanTilanKuvausEN: valinnanTulos.valinnantilanKuvauksenTekstiEN,
      julkaistavissa: valinnanTulos.julkaistavissa,
      hyvaksyttyVarasijalta: valinnanTulos.hyvaksyttyVarasijalta,
      hyvaksyPeruuntunut: valinnanTulos.hyvaksyPeruuntunut,
    };
  });
};

const refetchHakukohteenValinnanTulokset = ({
  queryClient,
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams & {
  queryClient: QueryClient;
}) => {
  const valintaQueryOptions = getHakukohteenValinnanTuloksetQueryOptions({
    hakuOid,
    hakukohdeOid,
  });
  queryClient.resetQueries(valintaQueryOptions);
  queryClient.invalidateQueries(valintaQueryOptions);
};

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
    valinnanTulokset: valinnanTulokset,
  });

  const queryClient = useQueryClient();

  const onUpdated = useCallback(() => {
    refetchHakukohteenValinnanTulokset({
      queryClient,
      hakuOid,
      hakukohdeOid,
    });
  }, [queryClient, hakukohdeOid, hakuOid]);

  const valinnanTulosActorRef = useValinnanTulosActorRef({
    haku,
    hakukohde,
    hakemukset,
    lastModified: valinnanTulokset.lastModified,
    onUpdated,
  });

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
      <ValinnanTuloksetSearchControls />
      <FormBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ValinnanTulosActions
          haku={haku}
          hakukohde={hakukohde}
          valinnanTulosActorRef={valinnanTulosActorRef}
        />
        <ValinnanTuloksetTable
          haku={haku}
          hakukohde={hakukohde}
          hakemukset={hakemuksetTuloksilla}
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
