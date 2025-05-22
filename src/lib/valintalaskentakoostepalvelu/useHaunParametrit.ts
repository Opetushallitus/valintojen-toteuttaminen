import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getHaunParametrit } from './valintalaskentakoostepalvelu-service';

const haunParametritQueryOptions = ({ hakuOid }: { hakuOid: string }) =>
  queryOptions({
    queryKey: ['getHaunParametrit', hakuOid],
    queryFn: () => getHaunParametrit(hakuOid),
    staleTime: 10 * 60 * 1000,
  });

export const useHaunParametrit = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(haunParametritQueryOptions({ hakuOid }));
