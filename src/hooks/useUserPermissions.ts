import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '@/lib/http-client';
import {
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
  Permission,
  selectUserPermissions,
  UserPermissionsByService,
  UserPermissions,
  checkHasPermission,
} from '@/lib/permissions';
import { PermissionError } from '@/lib/common';
import { isEmpty, unique } from 'remeda';
import { getConfiguration } from '../lib/configuration/client-configuration';
import {
  findBranchOidsFromOrganizationHierarchy,
  useOrganizationHierarchy,
} from '@/lib/organisaatio-service';
import { useMemo } from 'react';

const getUserPermissions = async (): Promise<UserPermissionsByService> => {
  const configuration = getConfiguration();
  const response = await client.get<{
    organisaatiot: Array<{
      organisaatioOid: string;
      kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
    }>;
  }>(configuration.routes.yleiset.kayttoikeusUrl);

  const userPermissions = selectUserPermissions(response.data);

  if (
    isEmpty(
      userPermissions[VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY]
        ?.readOrganizations ?? [],
    )
  ) {
    throw new PermissionError();
  }

  return userPermissions;
};

/**
 * Palauttaa tiedon siitä onko käyttäjällä käyttöoikeus johonkin annetuista organisaatioista
 *
 * @param organizationOids Organisaatioiden oidit, joista käyttöoikeus halutaan tarkistaa
 * @param permission Tarkistettava käyttöoikeus ('READ', 'READ_UPDATE', 'CRUD')
 * @returns
 */
export const useHasSomeOrganizationPermission = (
  organizationOids: Array<string> | string | undefined,
  permission: Permission,
  serviceKey?: string,
) => {
  const userPermissions = useUserPermissions(serviceKey);

  const hierarchyUserPermissions = useHierarchyUserPermissions(userPermissions);

  return checkHasPermission(
    organizationOids,
    hierarchyUserPermissions,
    permission,
  );
};

/**
 * Palauttaa funktion mikä tarkistaa onko käyttäjällä muokkausoikeuksia annettuun organisaatioon
 */
export const useCheckEditPermission = () => {
  const userPermissions = useUserPermissions();

  const hierarchyUserPermissions = useHierarchyUserPermissions(userPermissions);

  return (organizationOid: string) =>
    checkHasPermission(
      organizationOid,
      hierarchyUserPermissions,
      'READ_UPDATE',
    ) || checkHasPermission(organizationOid, hierarchyUserPermissions, 'CRUD');
};

/**
 * Täydentää parametrina annetut käyttöoikeudet organisaatiohierarkiasta kunkin organisaatiopuun haaran jälkeläisillä.
 * @param userPermissions Käyttöoikeudet käyttöoikeuspalvelusta.
 * @returns Täydennetyt käyttöoikeudet.
 */
export const useHierarchyUserPermissions = (
  userPermissions: UserPermissions,
): UserPermissions => {
  const { readOrganizations, writeOrganizations, crudOrganizations } =
    userPermissions;

  const allPermissionOrganizationOids = unique([
    ...crudOrganizations,
    ...writeOrganizations,
    ...readOrganizations,
  ]);

  const { data: organizationHierarchy } = useOrganizationHierarchy(
    allPermissionOrganizationOids,
  );

  return useMemo(
    () => ({
      hasOphCRUD: userPermissions.hasOphCRUD,
      crudOrganizations: findBranchOidsFromOrganizationHierarchy(
        organizationHierarchy,
        userPermissions.crudOrganizations,
      ),
      writeOrganizations: findBranchOidsFromOrganizationHierarchy(
        organizationHierarchy,
        userPermissions.writeOrganizations,
      ),
      readOrganizations: findBranchOidsFromOrganizationHierarchy(
        organizationHierarchy,
        userPermissions.readOrganizations,
      ),
    }),
    [userPermissions, organizationHierarchy],
  );
};

export const userPermissionsQueryOptions = {
  queryKey: ['getUserPermissions'],
  queryFn: getUserPermissions,
  staleTime: Infinity,
};

export const useQueryUserPermissions = () =>
  useQuery({ ...userPermissionsQueryOptions, throwOnError: false });

export const useUserPermissions = (
  serviceKey: string = VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
) => {
  const { data } = useSuspenseQuery(userPermissionsQueryOptions);
  return data[serviceKey];
};
