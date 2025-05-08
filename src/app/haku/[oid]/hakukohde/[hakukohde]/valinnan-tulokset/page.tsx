'use client';
import { use, useMemo } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box, Stack } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
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
import { SpinnerModal } from '@/components/modals/spinner-modal';
import { useSelector } from '@xstate/react';
import { ValinnanTulosState } from '@/lib/state/valinnan-tulos-machine';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { useValinnanTuloksetSearchParams } from './hooks/useValinnanTuloksetSearch';

const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
}): Array<HakemuksenValinnanTulos> => {
  return useMemo(
    () =>
      hakemukset.map((hakemus) => {
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
          ehdollisestiHyvaksyttavissa:
            valinnanTulos.ehdollisestiHyvaksyttavissa,
          ehdollisenHyvaksymisenEhtoKoodi:
            valinnanTulos.ehdollisenHyvaksymisenEhtoKoodi,
          ehcollisenHyvaksymisenEhtoFI:
            valinnanTulos.ehdollisenHyvaksymisenEhtoFI,
          ehdollisenHyvaksymisenEhtoSV:
            valinnanTulos.ehdollisenHyvaksymisenEhtoSV,
          ehdollisenHyvaksymisenEhtoEN:
            valinnanTulos.ehdollisenHyvaksymisenEhtoEN,
          valinnanTilanKuvausFI: valinnanTulos.valinnantilanKuvauksenTekstiFI,
          valinnanTilanKuvausSV: valinnanTulos.valinnantilanKuvauksenTekstiSV,
          valinnanTilanKuvausEN: valinnanTulos.valinnantilanKuvauksenTekstiEN,
          julkaistavissa: valinnanTulos.julkaistavissa,
          hyvaksyttyVarasijalta: valinnanTulos.hyvaksyttyVarasijalta,
          hyvaksyPeruuntunut: valinnanTulos.hyvaksyPeruuntunut,
        };
      }),
    [hakemukset, valinnanTulokset],
  );
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

  const valinnanTulosActorRef = useValinnanTulosActorRef({
    haku,
    hakukohde,
    hakemukset: hakemuksetTuloksilla,
    lastModified: valinnanTulokset.lastModified,
  });

  const { pageSize, setPageSize } = useValinnanTuloksetSearchParams();

  const state = useSelector(valinnanTulosActorRef, (state) => state);

  let spinnerTitle = '';
  if (state.matches(ValinnanTulosState.REMOVING)) {
    spinnerTitle = t('valinnan-tulokset.poistetaan-tuloksia');
  } else if (state.matches(ValinnanTulosState.PUBLISHING)) {
    spinnerTitle = t('valinnan-tulokset.julkaistaan-valintaesitystä');
  } else if (state.matches(ValinnanTulosState.UPDATING)) {
    spinnerTitle = t('valinnan-tulokset.tallennetaan-valinnan-tuloksia');
  }

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
      <SpinnerModal title={spinnerTitle} open={state.hasTag('saving')} />
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
        <ValinnanTulosActions
          haku={haku}
          hakukohde={hakukohde}
          valinnanTulosActorRef={valinnanTulosActorRef}
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
