import { OrganizationTree } from './organization-hierarchy';
import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { OPH_ORGANIZATION_OID } from './constants';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from './configuration/configuration-utils';
import { isHakukohderyhmaOid } from './common';

const getOrganizationHierarchy = async (
  organizationOidsParam: Array<string> = [],
) => {
  const organizationOids = new Set(
    organizationOidsParam.filter((oid) => !isHakukohderyhmaOid(oid)),
  );
  const hasOphOid = organizationOids.has(OPH_ORGANIZATION_OID);

  // Ei haluta noutaa organisaatiopuuta OPH-organisaatiolle, koska se palauttaa koko organisaatiopuun
  organizationOids.delete(OPH_ORGANIZATION_OID);

  if (organizationOids.size === 0) {
    return hasOphOid
      ? [
          {
            oid: OPH_ORGANIZATION_OID,
            children: [],
          },
        ]
      : [];
  }

  const configuration = getConfiguration();
  const url = new URL(
    getConfigUrl(configuration.routes.yleiset.organisaatioHierarkiaUrl),
  );
  url.searchParams.set('aktiiviset', 'true');
  url.searchParams.set('suunnitellut', 'false');
  url.searchParams.set('lakkautetut', 'false');
  url.searchParams.set('skipParents', 'true');
  for (const oid of organizationOids) {
    url.searchParams.append('oidRestrictionList', oid);
  }

  const res = await client.get<{
    numHits: number;
    organisaatiot: Array<OrganizationTree>;
  }>(url);

  const organisaatiot = res.data?.organisaatiot ?? [];

  return hasOphOid
    ? [
        {
          oid: OPH_ORGANIZATION_OID,
          children: organisaatiot,
        },
      ]
    : organisaatiot;
};

export const useOrganizationHierarchy = (organizationOids?: Array<string>) => {
  return useSuspenseQuery({
    queryKey: ['getOrganizationHierarchy', organizationOids],
    queryFn: () => getOrganizationHierarchy(organizationOids),
    staleTime: Infinity,
  });
};
