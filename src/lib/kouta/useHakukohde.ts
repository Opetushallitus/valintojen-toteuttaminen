import { useSuspenseQuery } from '@tanstack/react-query';
import { queryOptionsGetHakukohde } from './kouta-queries';

export const useHakukohde = ({ hakukohdeOid }: { hakukohdeOid: string }) =>
  useSuspenseQuery(queryOptionsGetHakukohde({ hakukohdeOid }));
