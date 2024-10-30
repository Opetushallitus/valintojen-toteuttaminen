import { queryOptions } from '@tanstack/react-query';
import { getHaunAsetukset } from '../lib/ohjausparametrit';

export const haunAsetuksetQueryOptions = ({ hakuOid }: { hakuOid: string }) =>
  queryOptions({
    queryKey: ['getHaunAsetukset', hakuOid],
    queryFn: () => getHaunAsetukset(hakuOid),
  });
