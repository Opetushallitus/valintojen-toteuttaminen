import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
  getHakemuksenValintalaskennanTulokset,
  getHakukohteenValintalaskennanTulokset,
  getHarkinnanvaraisetTilat,
} from '@/lib/valintalaskenta/valintalaskenta-service';
import { KoutaOidParams } from '../kouta/kouta-types';

export const queryOptionsGetHakukohteenValintalaskennanTulokset = (
  hakukohdeOid: string,
) =>
  queryOptions({
    queryKey: ['getHakukohteenValintalaskennanTulokset', hakukohdeOid],
    queryFn: () => getHakukohteenValintalaskennanTulokset(hakukohdeOid),
  });

export const refetchHakukohteenValintalaskennanTulokset = ({
  queryClient,
  hakukohdeOid,
}: {
  queryClient: QueryClient;
  hakukohdeOid: string;
}) => {
  const options =
    queryOptionsGetHakukohteenValintalaskennanTulokset(hakukohdeOid);
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};

export const queryOptionsGetHakemuksenValintalaskennanTulokset = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakemuksenValintalaskennanTulokset', hakuOid, hakemusOid],
    queryFn: () =>
      getHakemuksenValintalaskennanTulokset({ hakuOid, hakemusOid }),
  });

export const refetchHakemuksenValintalaskennanTulokset = ({
  queryClient,
  hakuOid,
  hakemusOid,
}: {
  queryClient: QueryClient;
  hakuOid: string;
  hakemusOid: string;
}) => {
  const options = queryOptionsGetHakemuksenValintalaskennanTulokset({
    hakuOid,
    hakemusOid,
  });
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};

export const queryOptionsGetharkinnanvaraisetTilat = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) =>
  queryOptions({
    queryKey: ['getHarkinnanvaraisetTilat', hakuOid, hakukohdeOid],
    queryFn: () => getHarkinnanvaraisetTilat({ hakuOid, hakukohdeOid }),
  });

export const refetchHarkinnanvaraisetTilat = ({
  queryClient,
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams & {
  queryClient: QueryClient;
}) => {
  const options = queryOptionsGetharkinnanvaraisetTilat({
    hakuOid,
    hakukohdeOid,
  });
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};
