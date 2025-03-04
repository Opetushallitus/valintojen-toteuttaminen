import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '../lib/http-client';
import { configuration } from '../lib/configuration';
import {
  OrganizationPermissions,
  UserPermissions,
  SERVICE_KEY,
  Permission,
  getOrgsForPermission,
} from '../lib/permissions';
import { PermissionError } from '../lib/common';
import { isNonNull } from 'remeda';

const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await client.get<{
    organisaatiot: Array<{
      organisaatioOid: string;
      kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
    }>;
    isAdmin: boolean;
  }>(configuration.kayttoikeusUrl);
  const organizations: Array<OrganizationPermissions> =
    response.data.organisaatiot
      .map((o) => {
        const permissions: Array<Permission> = o.kayttooikeudet
          .filter((o) => o.palvelu === SERVICE_KEY)
          .map((o) => o.oikeus);
        return permissions.length > 0
          ? { organizationOid: o.organisaatioOid, permissions }
          : null;
      })
      .filter(isNonNull);
  const userPermissions: UserPermissions = {
    admin: response.data.isAdmin,
    readOrganizations: getOrgsForPermission(organizations, 'READ'),
    writeOrganizations: getOrgsForPermission(organizations, 'READ_UPDATE'),
    crudOrganizations: getOrgsForPermission(organizations, 'CRUD'),
  };
  if (
    userPermissions.readOrganizations.length === 0 &&
    !userPermissions.admin
  ) {
    throw new PermissionError();
  }
  return userPermissions;
};

export const userPermissionsQueryOptions = {
  queryKey: ['getUserPermissions'],
  queryFn: getUserPermissions,
  staleTime: Infinity,
};

export const useQueryUserPermissions = () =>
  useQuery({ ...userPermissionsQueryOptions, throwOnError: false });

export const useUserPermissions = () =>
  useSuspenseQuery(userPermissionsQueryOptions);
