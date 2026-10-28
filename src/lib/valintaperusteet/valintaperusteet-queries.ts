import { queryOptions } from '@tanstack/react-query';
import {
  getHakukohteenValinnanvaiheet,
  getValintatapajononAktiivisetJarjestyskriteerit,
} from './valintaperusteet-service';

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
