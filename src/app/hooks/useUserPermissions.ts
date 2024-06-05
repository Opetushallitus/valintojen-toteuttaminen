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

const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await client.get(configuration.kayttoikeusUrl);
  const organizations: OrganizationPermissions[] = response.data.organisaatiot
    .map(
      (o: {
        organisaatioOid: string;
        kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
      }) => {
        const permissions: Permission[] = o.kayttooikeudet
          .filter((o) => o.palvelu === SERVICE_KEY)
          .map((o) => o.oikeus);
        return permissions.length > 0
          ? { organizationOid: o.organisaatioOid, permissions }
          : null;
      },
    )
    .filter((o: OrganizationPermissions | null) => o !== null);
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

const queryProps = {
  queryKey: ['getUserPermissions'],
  queryFn: getUserPermissions,
  staleTime: Infinity,
};

export const useQueryUserPermissions = () =>
  useQuery({ ...queryProps, throwOnError: false });

export const useUserPermissions = () => useSuspenseQuery(queryProps);
