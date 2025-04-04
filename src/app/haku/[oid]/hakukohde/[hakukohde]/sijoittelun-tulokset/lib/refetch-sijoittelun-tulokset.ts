import { getLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { QueryClient } from '@tanstack/react-query';

export const refetchSijoittelunTulokset = (
  hakuOid: string,
  hakukohdeOid: string,
  queryClient: QueryClient,
) => {
  const options = getLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions({
    hakuOid,
    hakukohdeOid,
  });
  queryClient.invalidateQueries(options);
  queryClient.resetQueries(options);
};
