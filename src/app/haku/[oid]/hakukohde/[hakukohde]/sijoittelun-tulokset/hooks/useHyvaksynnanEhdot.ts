'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHyvaksynnanEhdot } from '@/app/lib/koodisto';

export const useHyvaksynnanEhdot = () =>
  useSuspenseQuery({
    queryKey: ['getHyvaksynnanEhdot'],
    queryFn: () => getHyvaksynnanEhdot(),
    staleTime: Infinity,
  });
