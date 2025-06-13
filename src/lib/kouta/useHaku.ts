import { useSuspenseQuery } from '@tanstack/react-query';
import { queryOptionsGetHaku } from './kouta-queries';

export const useHaku = ({ hakuOid }: { hakuOid: string }) =>
  useSuspenseQuery(queryOptionsGetHaku({ hakuOid }));
