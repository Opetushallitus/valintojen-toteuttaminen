import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { configuration } from './configuration';
import { OPH_ORGANIZATION_OID } from './constants';

export const getOrganisaatioParentOids = async (oid: string) => {
  if (oid === OPH_ORGANIZATION_OID) {
    return [OPH_ORGANIZATION_OID];
  }
  const response = await client.get<Array<string>>(
    configuration.organisaatioParentOidsUrl(oid),
  );
  return response.data;
};

export const useOrgParentOids = (oid: string) => {
  return useSuspenseQuery({
    queryKey: ['getOrganisaatioParentOids', oid],
    queryFn: () => getOrganisaatioParentOids(oid),
    staleTime: Infinity,
  });
};
