import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { configuration } from './configuration';
import { OPH_ORGANIZATION_OID } from './constants';

export const getOrganizationParentOids = async (oid: string) => {
  // OPH:n organisaatio-OID:n parent on aina organisaatio itse. Ei tarvetta noutaa.
  if (oid === OPH_ORGANIZATION_OID) {
    return [OPH_ORGANIZATION_OID];
  }
  const response = await client.get<Array<string>>(
    configuration.organisaatioParentOidsUrl(oid),
  );
  return response.data;
};

export const useOrganizationParentOids = (oid: string) => {
  return useSuspenseQuery({
    queryKey: ['getOrganisaatioParentOids', oid],
    queryFn: () => getOrganizationParentOids(oid),
    staleTime: Infinity,
  });
};
