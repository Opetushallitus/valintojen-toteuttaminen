'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHyvaksynnanEhdot } from '@/app/lib/koodisto/koodisto-service';

export const useHyvaksynnanEhdot = () =>
  useSuspenseQuery({
    queryKey: ['getHyvaksynnanEhdot'],
    queryFn: () => getHyvaksynnanEhdot(),
    staleTime: Infinity,
  });
