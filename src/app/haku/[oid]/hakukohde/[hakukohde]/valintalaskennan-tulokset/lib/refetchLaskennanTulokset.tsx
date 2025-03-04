import { hakukohteenValintalaskennanTuloksetQueryOptions } from '@/lib/valintalaskenta/valintalaskenta-service';
import { QueryClient } from '@tanstack/react-query';

export const refetchLaskennanTulokset = ({
  queryClient,
  hakukohdeOid,
}: {
  queryClient: QueryClient;
  hakukohdeOid: string;
}) => {
  const options = hakukohteenValintalaskennanTuloksetQueryOptions(hakukohdeOid);
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};
