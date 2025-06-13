import { useSuspenseQuery } from '@tanstack/react-query';
import { queryOptionsGetHaunParametrit } from './valintalaskentakoostepalvelu-queries';

export const useHaunParametrit = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(queryOptionsGetHaunParametrit({ hakuOid }));
