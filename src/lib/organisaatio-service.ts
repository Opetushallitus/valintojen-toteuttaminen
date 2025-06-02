import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { OPH_ORGANIZATION_OID } from './constants';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from './configuration/configuration-utils';
import { unique } from 'remeda';

type OrganizationTree = {
  oid: string;
  children?: Array<OrganizationTree>;
};

const getOrganizationHierarchy = async (
  organizationOidsParam?: Array<string>,
) => {
  let hasOphOid = false;

  const organizationOids = unique(organizationOidsParam ?? []).filter(
    // Ei haluta noutaa organisaatiopuuta OPH-organisaatiolle
    (oid) => {
      if (oid === OPH_ORGANIZATION_OID) {
        hasOphOid = true;
        return false;
      } else {
        return true;
      }
    },
  );

  if (organizationOids.length === 0) {
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

export const findBranchOidsFromOrganizationHierarchy = (
  hierarchy: Array<OrganizationTree>,
  organizationOids: Array<string>,
  includeTree?: boolean,
): Array<string> => {
  if (includeTree === false || !hierarchy || hierarchy.length === 0) {
    return [];
  }

  return hierarchy.flatMap((node) => {
    const shouldInclude = Boolean(
      organizationOids.includes(node.oid) || includeTree,
    );
    const result = shouldInclude ? [node.oid] : [];
    return [
      ...result,
      ...findBranchOidsFromOrganizationHierarchy(
        node.children ?? [],
        organizationOids,
        Boolean(includeTree || organizationOids.includes(node.oid)),
      ),
    ];
  });
};

export const useOrganizationHierarchy = (organizationOids?: Array<string>) => {
  return useSuspenseQuery({
    queryKey: ['getOrganisaatioHierarkia', organizationOids],
    queryFn: () => getOrganizationHierarchy(organizationOids),
    staleTime: Infinity,
  });
};
