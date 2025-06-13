'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getKoulutustyypit } from '@/lib/koodisto/koodisto-service';

export const useKoulutustyypit = () =>
  useSuspenseQuery({
    queryKey: ['getKoulutustyypit'],
    queryFn: () => getKoulutustyypit(),
    staleTime: Infinity,
  });
