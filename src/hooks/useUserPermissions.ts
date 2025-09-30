import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '@/lib/http-client';
import {
  Permission,
  selectUserPermissions,
  UserPermissions,
  checkHasPermission,
  EMPTY_USER_PERMISSIONS,
} from '@/lib/permissions';
import { PermissionError } from '@/lib/common';
import { isEmpty, unique } from 'remeda';
import { getConfiguration } from '../lib/configuration/client-configuration';
import {
  findBranchOidsFromOrganizationHierarchy,
  useOrganizationHierarchy,
} from '@/lib/organisaatio-service';
import { useMemo } from 'react';

const getUserPermissions = async (): Promise<UserPermissions> => {
  const configuration = getConfiguration();
  const response = await client.get<{
    organisaatiot: Array<{
      organisaatioOid: string;
      kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
    }>;
  }>(configuration.routes.yleiset.kayttoikeusUrl);

  const userPermissions = selectUserPermissions(response.data);

  if (isEmpty(userPermissions?.readOrganizations ?? [])) {
    throw new PermissionError();
  }

  return userPermissions;
};

/**
 * Palauttaa funktion mikä tarkistaa onko käyttäjällä oikeuksia annettuun organisaatioon
 *
 * @param permission Tarkistettava käyttöoikeus ('READ', 'READ_UPDATE', 'CRUD')
 */
export const useCheckPermission = (permission: Permission) => {
  const userPermissions = useUserPermissions();

  const hierarchyUserPermissions = useHierarchyUserPermissions(userPermissions);

  return (organizationOid: string) =>
    checkHasPermission(organizationOid, hierarchyUserPermissions, permission);
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
      sijoitteluPeruuntuneidenHyvaksyntaAllowed:
        userPermissions.sijoitteluPeruuntuneidenHyvaksyntaAllowed,
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

export const useUserPermissions = () => {
  const { data } = useSuspenseQuery(userPermissionsQueryOptions);
  return data ?? EMPTY_USER_PERMISSIONS;
};
