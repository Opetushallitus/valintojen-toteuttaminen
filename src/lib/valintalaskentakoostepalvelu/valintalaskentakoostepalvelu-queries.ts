import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
  getDocumentIdForHakukohde,
  getHakukohteidenSuodatustiedot,
  getHaunParametrit,
  getKirjepohjatHakukohteelle,
  getPisteetForHakukohde,
} from './valintalaskentakoostepalvelu-service';
import {
  DokumenttiTyyppi,
  KirjepohjaNimi,
} from './valintalaskentakoostepalvelu-types';
import { Hakukohde, KoutaOidParams } from '@/lib/kouta/kouta-types';
import { getOpetuskieliCode } from '@/lib/kouta/kouta-service';

type KirjepohjatQueryParams = {
  template: KirjepohjaNimi;
  hakukohde: Hakukohde;
};

export const queryOptionsGetKirjepohjatHakukohteelle = ({
  template,
  hakukohde,
}: KirjepohjatQueryParams) => {
  const params = {
    kirjepohjanNimi: template,
    hakuOid: hakukohde.hakuOid,
    hakukohdeOid: hakukohde.oid,
    tarjoajaOid: hakukohde.tarjoajaOid,
    opetuskieli: getOpetuskieliCode(hakukohde),
  };
  return queryOptions({
    queryKey: ['getKirjepohjatHakukohteelle', params],
    queryFn: () => getKirjepohjatHakukohteelle(params),
  });
};

export const queryOptionsGetPisteetForHakukohde = (params: KoutaOidParams) =>
  queryOptions({
    queryKey: ['getPistetiedotHakukohteelle', params],
    queryFn: () => getPisteetForHakukohde(params),
  });

export const refetchPisteetForHakukohde = (
  queryClient: QueryClient,
  params: KoutaOidParams,
) => {
  const options = queryOptionsGetPisteetForHakukohde(params);
  queryClient.invalidateQueries(options);
  queryClient.refetchQueries(options);
};

export const queryOptionsGetHaunParametrit = ({
  hakuOid,
}: {
  hakuOid: string;
}) =>
  queryOptions({
    queryKey: ['getHaunParametrit', hakuOid],
    queryFn: () => getHaunParametrit(hakuOid),
    staleTime: 10 * 60 * 1000,
  });

export const queryOptionsGetDocumentIdForHakukohde = ({
  hakukohdeOid,
  documentType,
}: {
  hakukohdeOid: string;
  documentType: DokumenttiTyyppi;
}) =>
  queryOptions({
    queryKey: ['getDocumentIdForHakukohde', hakukohdeOid, documentType],
    queryFn: () => getDocumentIdForHakukohde(hakukohdeOid, documentType),
  });

export const queryOptionsGetHakukohteidenSuodatustiedot = ({
  hakuOid,
}: {
  hakuOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakukohteidenSuodatustiedot', hakuOid],
    queryFn: () => getHakukohteidenSuodatustiedot({ hakuOid }),
  });
