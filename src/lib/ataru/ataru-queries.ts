import { queryOptions } from '@tanstack/react-query';
import { getHakemukset, GetHakemuksetParams } from './ataru-service';

export const queryOptionsGetHakemukset = (params: GetHakemuksetParams) => {
  return queryOptions({
    queryKey: ['getHakemukset', params],
    queryFn: () => getHakemukset(params),
  });
};
