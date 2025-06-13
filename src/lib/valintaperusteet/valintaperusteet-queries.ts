import { queryOptions } from '@tanstack/react-query';
import { getHakukohteenValinnanvaiheet } from './valintaperusteet-service';

export const queryOptionsGetHakukohteenValinnanvaiheet = (
  hakukohdeOid: string,
) => {
  return queryOptions({
    queryKey: ['getHakukohteenValinnanvaiheet', hakukohdeOid],
    queryFn: () => getHakukohteenValinnanvaiheet(hakukohdeOid),
  });
};
