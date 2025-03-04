import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '@/lib/http-client';
import { configuration } from '@/lib/configuration';
import {
  OrganizationPermissions,
  UserPermissions,
  SERVICE_KEY,
  Permission,
  getOrgsForPermission,
} from '@/lib/permissions';
import { PermissionError } from '@/lib/common';
import { intersection, isNonNull } from 'remeda';
import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { useOrganizationParentOids } from '@/lib/organisaatio-service';

const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await client.get<{
    organisaatiot: Array<{
      organisaatioOid: string;
      kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
    }>;
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

  const crudOrganizations = getOrgsForPermission(organizations, 'CRUD');

  const userPermissions: UserPermissions = {
    hasOphCRUD: crudOrganizations.includes(OPH_ORGANIZATION_OID),
    readOrganizations: getOrgsForPermission(organizations, 'READ'),
    writeOrganizations: getOrgsForPermission(organizations, 'READ_UPDATE'),
    crudOrganizations,
  };
  if (userPermissions.readOrganizations.length === 0) {
    throw new PermissionError();
  }
  return userPermissions;
};

export const useHasOrganizationPermissions = (
  oid: string,
  permission: Permission,
) => {
  const { data: userPermissions } = useUserPermissions();
  const { readOrganizations, writeOrganizations, crudOrganizations } =
    userPermissions;

  let permissionOrganizationOids = readOrganizations;
  if (permission === 'CRUD') {
    permissionOrganizationOids = crudOrganizations;
  } else if (permission === 'READ_UPDATE') {
    permissionOrganizationOids = writeOrganizations;
  }

  const { data: organizationParentOids } = useOrganizationParentOids(oid);

  return (
    intersection(organizationParentOids, permissionOrganizationOids).length > 0
  );
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
