import { queryOptions } from '@tanstack/react-query';
import {
  getHakukohteenValinnanvaiheet,
  getLaskentakaava,
  getValintaryhmat,
  getValintatapajononJarjestyskriteerit,
} from './valintaperusteet-service';
import { UserPermissions } from '../permissions';

export const queryOptionsGetLaskentakaava = (laskentakaavaId: number) =>
  queryOptions({
    queryKey: ['getLaskentakaava', laskentakaavaId],
    queryFn: () => getLaskentakaava(laskentakaavaId),
  });

export const queryOptionsGetValintatapajononJarjestyskriteerit = (
  valintatapajonoOid: string,
) => {
  return queryOptions({
    queryKey: ['getValintatapajononJarjestyskriteerit', valintatapajonoOid],
    queryFn: () => getValintatapajononJarjestyskriteerit(valintatapajonoOid),
  });
};

export const queryOptionsGetHakukohteenValinnanvaiheet = (
  hakukohdeOid: string,
) => {
  return queryOptions({
    queryKey: ['getHakukohteenValinnanvaiheet', hakukohdeOid],
    queryFn: () => getHakukohteenValinnanvaiheet(hakukohdeOid),
  });
};

export const queryOptionsGetValintaryhmat = (
  hakuOid: string,
  userPermissions: UserPermissions,
  hakukohdeOids: Array<string>,
) => {
  return queryOptions({
    queryKey: ['getValintaryhmat', hakuOid, userPermissions, hakukohdeOids],
    queryFn: () => getValintaryhmat(hakuOid, userPermissions, hakukohdeOids),
  });
};
