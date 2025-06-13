import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
  getChangeHistoryForHakemus,
  getHakemuksenValinnanTulokset,
  getHakukohteenValinnanTulokset,
  getLatestSijoitteluajonTuloksetForHakemus,
  getLatestSijoitteluajonTuloksetWithValintaEsitys,
} from './valinta-tulos-service';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

export const queryOptionsGetLatestSijoitteluajonTuloksetForHakemus = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) =>
  queryOptions({
    queryKey: [
      'getLatestSijoitteluajonTuloksetForHakemus',
      hakuOid,
      hakemusOid,
    ],
    queryFn: () =>
      getLatestSijoitteluajonTuloksetForHakemus({ hakuOid, hakemusOid }),
  });

export const queryOptionsGetHakemuksenValinnanTulokset = ({
  hakemusOid,
}: {
  hakemusOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakemuksenValinnanTulokset', hakemusOid],
    queryFn: () => getHakemuksenValinnanTulokset({ hakemusOid }),
  });

export const refetchHakemuksenValinnanTulokset = ({
  queryClient,
  hakemusOid,
}: {
  queryClient: QueryClient;
  hakemusOid: string;
}) => {
  const valintaQueryOptions = queryOptionsGetHakemuksenValinnanTulokset({
    hakemusOid,
  });
  queryClient.resetQueries(valintaQueryOptions);
  queryClient.invalidateQueries(valintaQueryOptions);
};

export const queryOptionsGetHakukohteenValinnanTulokset = (
  params: KoutaOidParams,
) =>
  queryOptions({
    queryKey: ['getHakukohteenValinnanTulokset', params],
    queryFn: () => getHakukohteenValinnanTulokset(params),
  });

export const refetchHakukohteenValinnanTulokset = ({
  queryClient,
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams & {
  queryClient: QueryClient;
}) => {
  const valintaQueryOptions = queryOptionsGetHakukohteenValinnanTulokset({
    hakuOid,
    hakukohdeOid,
  });
  queryClient.resetQueries(valintaQueryOptions);
  queryClient.invalidateQueries(valintaQueryOptions);
};

export const queryOptionsGetLatestSijoitteluajonTuloksetWithValintaEsitys = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) =>
  queryOptions({
    queryKey: [
      'getLatestSijoitteluajonTuloksetWithValintaEsitys',
      hakuOid,
      hakukohdeOid,
    ],
    queryFn: () =>
      getLatestSijoitteluajonTuloksetWithValintaEsitys(hakuOid, hakukohdeOid),
  });

export const refetchLatestSijoitteluajonTuloksetWithValintaEsitys = (
  hakuOid: string,
  hakukohdeOid: string,
  queryClient: QueryClient,
) => {
  const options = queryOptionsGetLatestSijoitteluajonTuloksetWithValintaEsitys({
    hakuOid,
    hakukohdeOid,
  });
  queryClient.invalidateQueries(options);
  queryClient.resetQueries(options);
};

export const queryOptionsGetChangeHistoryForHakemus = (params: {
  hakemusOid: string;
  valintatapajonoOid: string;
}) =>
  queryOptions({
    queryKey: [
      'getChangeHistoryForHakemus',
      params.hakemusOid,
      params.valintatapajonoOid,
    ],
    queryFn: () =>
      getChangeHistoryForHakemus(params.hakemusOid, params.valintatapajonoOid),
  });
