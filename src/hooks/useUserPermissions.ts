import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '@/lib/http-client';
import {
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
  Permission,
  selectUserPermissions,
  UserPermissionsByService,
  UserPermissions,
} from '@/lib/permissions';
import { PermissionError } from '@/lib/common';
import { isEmpty, unique } from 'remeda';
import { getConfiguration } from '../lib/configuration/client-configuration';
import {
  findBranchOidsFromOrganizationHierarchy,
  useOrganizationHierarchy,
} from '@/lib/organisaatio-service';
import { OPH_ORGANIZATION_OID } from '@/lib/constants';
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
 * Tarkistaa onko käyttäjällä käyttöoikeus ainakin yhteen annetuista organisaatioista
 * @param organizationOids Organisaatioiden oidit, joiden käyttöoikeudet halutaan tarkistaa
 * @param permissionOrganizationOids Kaikki organisaatioiden oidit organisaatiopuusta, joihin käyttäjällä on käyttöoikeus
 * @returns
 */

export const checkHasSomeOrganizationPermission = (
  organizationOids: Array<string> | string | undefined = [],
  permissionOrganizationOids: Array<string> | undefined = [],
) => {
  // Jos on oikeus OPH-organisaatioon, on myös oikeus kaikkiin muihin organisaatioihin
  if (permissionOrganizationOids.includes(OPH_ORGANIZATION_OID)) {
    return true;
  }

  const organizationOidsArray =
    organizationOids === undefined || Array.isArray(organizationOids)
      ? organizationOids
      : [organizationOids];

  return (
    permissionOrganizationOids.find((oid) =>
      organizationOidsArray?.includes(oid),
    ) !== undefined
  );
};

export const selectOrganizationsOidsByPermission = (
  userPermissions: UserPermissions,
  permission: Permission,
) => {
  switch (permission) {
    case 'READ':
      return userPermissions.readOrganizations;
    case 'READ_UPDATE':
      return userPermissions.writeOrganizations;
    case 'CRUD':
      return userPermissions.crudOrganizations;
    default:
      throw new Error(`Unknown permission type: ${permission}`);
  }
};

export const hasHierarchyPermission = (
  organizationOids: Array<string> | string | undefined,
  hierarchyPermissions: UserPermissions,
  permission: Permission,
) => {
  const permissionOrganizationOids = selectOrganizationsOidsByPermission(
    hierarchyPermissions,
    permission,
  );

  return checkHasSomeOrganizationPermission(
    organizationOids,
    permissionOrganizationOids,
  );
};

/**
 * Tarkistaa onko käyttäjällä käyttöoikeus johonkin annetuista organisaatioista
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

  const hierarchyUserPermissionOids = selectOrganizationsOidsByPermission(
    hierarchyUserPermissions,
    permission,
  );

  return checkHasSomeOrganizationPermission(
    organizationOids,
    hierarchyUserPermissionOids,
  );
};

export const useHierarchyUserPermissions = (
  userPermissions: UserPermissions,
) => {
  const { readOrganizations, writeOrganizations, crudOrganizations } =
    userPermissions;

  const allPermissionOrganizationOids = unique([
    ...readOrganizations,
    ...writeOrganizations,
    ...crudOrganizations,
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
