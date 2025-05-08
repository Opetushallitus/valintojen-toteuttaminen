'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/lib/localization/useTranslations';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
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
import { HakemusValinnanTuloksilla } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { TranslatedName } from '@/lib/localization/localization-types';

const nonEmptyTranslatedName = (tn: TranslatedName) =>
  tn.fi || tn.sv || tn.en ? tn : undefined;

const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
}): Array<HakemusValinnanTuloksilla> => {
  return hakemukset.map((hakemus) => {
    const valinnanTulos = valinnanTulokset.data[hakemus.hakemusOid];
    return {
      ...hakemus,
      valinnanTulos: valinnanTulos
        ? {
            hakukohdeOid: valinnanTulos.hakukohdeOid,
            valintatapajonoOid: valinnanTulos.valintatapajonoOid,
            valinnanTila: valinnanTulos.valinnantila,
            vastaanottoTila: valinnanTulos.vastaanottotila,
            ilmoittautumisTila: valinnanTulos.ilmoittautumistila,
            ehdollisenHyvaksymisenEhtoKoodi:
              valinnanTulos.ehdollisenHyvaksymisenEhtoKoodi,
            ehdollisenHyvaksymisenEhto: nonEmptyTranslatedName({
              fi: valinnanTulos.ehdollisenHyvaksymisenEhtoFI,
              sv: valinnanTulos.ehdollisenHyvaksymisenEhtoSV,
              en: valinnanTulos.ehdollisenHyvaksymisenEhtoEN,
            }),
            valinnanTilanKuvaus: nonEmptyTranslatedName({
              fi: valinnanTulos.valinnantilanKuvauksenTekstiFI,
              sv: valinnanTulos.valinnantilanKuvauksenTekstiSV,
              en: valinnanTulos.valinnantilanKuvauksenTekstiEN,
            }),
            julkaistavissa: valinnanTulos.julkaistavissa,
          }
        : undefined,
    };
  });
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
        <ValinnanTuloksetTable
          haku={haku}
          hakukohde={hakukohde}
          hakemukset={hakemuksetTuloksilla}
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
