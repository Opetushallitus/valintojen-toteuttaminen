import { queryOptions } from '@tanstack/react-query';
import {
  getHakukohteenValinnanvaiheet,
  getLaskentakaava,
  getValintatapajononJarjestyskriteerit,
} from './valintaperusteet-service';

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
