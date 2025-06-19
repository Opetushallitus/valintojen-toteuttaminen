import { useSuspenseQuery } from '@tanstack/react-query';
import { queryOptionsGetHaunAsetukset } from './ohjausparametrit-queries';

export const useHaunAsetukset = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(queryOptionsGetHaunAsetukset({ hakuOid }));
