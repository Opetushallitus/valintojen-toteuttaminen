export type OrganizationTree = {
  oid: string;
  children?: Array<OrganizationTree>;
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
