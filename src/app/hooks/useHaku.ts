import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getHaku } from '../lib/kouta';

export const hakuQueryOptions = ({ hakuOid }: { hakuOid: string }) =>
  queryOptions({
    queryKey: ['getHaku', hakuOid],
    queryFn: () => getHaku(hakuOid),
  });

export const useHaku = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(hakuQueryOptions({ hakuOid }));
