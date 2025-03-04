'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakutavat } from '../lib/koodisto/koodisto-service';

export const useHakutavat = () =>
  useSuspenseQuery({
    queryKey: ['getHakutavat'],
    queryFn: () => getHakutavat(),
    staleTime: Infinity,
  });
