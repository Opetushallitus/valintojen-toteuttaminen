import { hakukohteenLasketutValinnanvaiheetQueryOptions } from '@/app/hooks/useLasketutValinnanVaiheet';
import { QueryClient } from '@tanstack/react-query';

export const refetchLaskennanTulokset = ({
  queryClient,
  hakukohdeOid,
}: {
  queryClient: QueryClient;
  hakukohdeOid: string;
}) => {
  const options = hakukohteenLasketutValinnanvaiheetQueryOptions(hakukohdeOid);
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};
