import { useSuspenseQuery } from '@tanstack/react-query';
import { getHaku } from '../lib/kouta';
import { getHaunAsetukset } from '../lib/ohjausparametrit';

export const useHaku = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery({
    queryKey: ['getHaku', hakuOid],
    queryFn: () => getHaku(hakuOid),
  });

export const useHaunAsetukset = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery({
    queryKey: ['getHaunAsetukset', hakuOid],
    queryFn: () => getHaunAsetukset(hakuOid),
  });
