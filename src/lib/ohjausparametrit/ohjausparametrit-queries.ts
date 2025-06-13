import { queryOptions } from '@tanstack/react-query';
import { getHaunAsetukset } from './ohjausparametrit-service';

export const queryOptionsGetHaunAsetukset = ({
  hakuOid,
}: {
  hakuOid: string;
}) =>
  queryOptions({
    queryKey: ['getHaunAsetukset', hakuOid],
    queryFn: () => getHaunAsetukset(hakuOid),
    staleTime: 10 * 60 * 1000,
  });
