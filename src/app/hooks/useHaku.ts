import { useSuspenseQuery } from '@tanstack/react-query';
import { getHaku } from '../lib/kouta';

export const useHaku = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery({
    queryKey: ['getHaku', hakuOid],
    queryFn: () => getHaku(hakuOid),
  });
