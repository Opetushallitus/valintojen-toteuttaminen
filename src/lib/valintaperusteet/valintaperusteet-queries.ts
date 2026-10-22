import { queryOptions } from '@tanstack/react-query';
import {
  getHakukohteenValinnanvaiheet,
  getLaskentakaava,
  getValintatapajononAktiivisetJarjestyskriteerit,
} from './valintaperusteet-service';

export const queryOptionsGetLaskentakaava = (laskentakaavaId: number) => {
  return queryOptions({
    queryKey: ['getLaskentakaava', laskentakaavaId],
    queryFn: () => getLaskentakaava(laskentakaavaId),
  });
};

export const queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit = (
  valintatapajonoOid: string,
) => {
  return queryOptions({
    queryKey: [
      'getValintatapajononAktiivisetJarjestyskriteerit',
      valintatapajonoOid,
    ],
    queryFn: () =>
      getValintatapajononAktiivisetJarjestyskriteerit(valintatapajonoOid),
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
