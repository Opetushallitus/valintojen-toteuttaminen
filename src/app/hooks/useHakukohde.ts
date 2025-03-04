import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '../lib/kouta/kouta-service';

export const hakukohdeQueryOptions = ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakukohde', hakukohdeOid],
    queryFn: () => getHakukohde(hakukohdeOid),
  });

export const useHakukohde = ({ hakukohdeOid }: { hakukohdeOid: string }) =>
  useSuspenseQuery(hakukohdeQueryOptions({ hakukohdeOid }));
