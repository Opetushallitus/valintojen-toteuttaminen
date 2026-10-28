import { queryOptions } from '@tanstack/react-query';
import {
  getHakemukset,
  GetHakemuksetParams,
  getHakijat,
  GetHakijatParams,
} from './ataru-service';

export const queryOptionsGetHakemukset = (params: GetHakemuksetParams) => {
  return queryOptions({
    queryKey: ['getHakemukset', params],
    queryFn: () => getHakemukset(params),
  });
};

export const queryOptionsGetHakijat = (params: GetHakijatParams) => {
  return queryOptions({
    queryKey: ['getHakijat', params],
    queryFn: async () => getHakijat(params),
  });
};
