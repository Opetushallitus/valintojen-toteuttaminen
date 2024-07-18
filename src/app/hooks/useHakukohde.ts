import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '../lib/kouta';

export const useHakukohde = ({ hakukohdeOid }: { hakukohdeOid: string }) =>
  useSuspenseQuery({
    queryKey: ['getHakukohde', hakukohdeOid],
    queryFn: () => getHakukohde(hakukohdeOid),
  });
