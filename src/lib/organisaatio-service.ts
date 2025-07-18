import { useSuspenseQuery } from '@tanstack/react-query';
import { client } from './http-client';
import { OPH_ORGANIZATION_OID } from './constants';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from './configuration/configuration-utils';

type OrganizationTree = {
  oid: string;
  children?: Array<OrganizationTree>;
};

const getOrganizationHierarchy = async (
  organizationOidsParam: Array<string> = [],
) => {
  const organizationOids = new Set(organizationOidsParam);
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

/**
 * Käy organisaatiohierarkian läpi, etsii parametrina annettujen organisaatioiden haarat, ja palauttaa niiden OID-solmuluokat listana.
 *
 * @param hierarchy - Organisaatiohierarkia, jota käydään läpi.
 * @param organizationOids - Taulukko organisaatioiden OID-tunnisteista, joiden haaroja etsitään.
 * @param includeTree - Sisällytetäänkö koko organisaatiopuun haara? Käytetään rekursiivisissa kutsuissa. Älä aseta tätä kutsuessasi!
 * @returns Lista OIDeista, jotka löytyivät hierarkiasta annettujen sääntöjen mukaisesti.
 */
export const findBranchOidsFromOrganizationHierarchy = (
  hierarchy: Array<OrganizationTree> | undefined = [],
  organizationOids: Array<string>,
  includeTree: boolean = false,
): Array<string> => {
  return hierarchy.flatMap((node) => {
    const shouldInclude = includeTree || organizationOids.includes(node.oid);
    return [
      ...(shouldInclude ? [node.oid] : []),
      ...findBranchOidsFromOrganizationHierarchy(
        node.children,
        organizationOids,
        shouldInclude,
      ),
    ];
  });
};

export const useOrganizationHierarchy = (organizationOids?: Array<string>) => {
  return useSuspenseQuery({
    queryKey: ['getOrganizationHierarchy', organizationOids],
    queryFn: () => getOrganizationHierarchy(organizationOids),
    staleTime: Infinity,
  });
};
