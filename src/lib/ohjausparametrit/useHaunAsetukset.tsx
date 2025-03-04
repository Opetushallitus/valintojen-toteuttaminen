import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getHaunAsetukset } from './ohjausparametrit-service';

export const haunAsetuksetQueryOptions = ({ hakuOid }: { hakuOid: string }) =>
  queryOptions({
    queryKey: ['getHaunAsetukset', hakuOid],
    queryFn: () => getHaunAsetukset(hakuOid),
    staleTime: 10 * 60 * 1000,
  });

export const useHaunAsetukset = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(haunAsetuksetQueryOptions({ hakuOid }));
