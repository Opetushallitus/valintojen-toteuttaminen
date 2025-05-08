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
import { HakemusValinnanTuloksilla } from './lib/valinnan-tulos-types';
import { omit, prop, sortBy } from 'remeda';

const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
}): Array<HakemusValinnanTuloksilla> => {
  return sortBy(
    hakemukset.map((hakemus) => {
      const tulos = valinnanTulokset.data[hakemus.hakemusOid];

      return {
        ...hakemus,
        valinnanTulos: tulos
          ? {
              ...omit(tulos, ['ilmoittautumistila']),
              ilmoittautumisTila: tulos.ilmoittautumistila,
            }
          : undefined,
      };
    }),
    prop('hakijanNimi'),
  );
};

const ValinnanTuloksetContent = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { t } = useTranslations();

  const [{ data: valinnanTulokset }, { data: hakemukset }] = useSuspenseQueries(
    {
      queries: [
        getHakukohteenValinnanTuloksetQueryOptions({
          hakuOid,
          hakukohdeOid,
        }),
        getHakemuksetQueryOptions({
          hakuOid,
          hakukohdeOid,
        }),
      ],
    },
  );

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
      <FormBox>
        <ValinnanTuloksetTable hakemukset={hakemuksetTuloksilla} />
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
