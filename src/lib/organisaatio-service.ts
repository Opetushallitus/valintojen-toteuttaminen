import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { OPH_ORGANIZATION_OID } from './constants';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from './configuration/configuration-utils';

export const getOrganizationParentOids = async (oid: string) => {
  const configuration = getConfiguration();
  // OPH:n organisaatio-OID:n parent on aina organisaatio itse. Ei tarvetta noutaa.
  if (oid === OPH_ORGANIZATION_OID) {
    return [OPH_ORGANIZATION_OID];
  }
  const response = await client.get<Array<string>>(
    getConfigUrl(configuration.routes.yleiset.organisaatioParentOidsUrl, {
      oid,
    }),
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
