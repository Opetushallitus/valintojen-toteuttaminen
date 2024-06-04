import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '../lib/http-client';
import { configuration } from '../lib/configuration';
import {
  OrganizationPermissions,
  UserPermissions,
  AUTH_SERVICE,
  Permission,
  getOrgsForPermission,
} from '../lib/permissions';

export const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await client.get(configuration.kayttoikeusUrl);
  if (!response.data) {
    throw Error('Unable to get user data');
  }
  const organizations: OrganizationPermissions[] = response.data.organisaatiot
    .map(
      (o: {
        organisaatioOid: string;
        kayttooikeudet: [{ palvelu: string; oikeus: Permission }];
      }) => {
        const rights: Permission[] = o.kayttooikeudet
          .filter((o) => o.palvelu === AUTH_SERVICE)
          .map((o) => o.oikeus);
        return rights.length > 0
          ? { organizationOid: o.organisaatioOid, rights }
          : null;
      },
    )
    .filter((o: OrganizationPermissions | null) => o !== null);
  const userRights: UserPermissions = {
    admin: response.data.isAdmin,
    readOrganizations: getOrgsForPermission(organizations, 'READ'),
    writeOrganizations: getOrgsForPermission(organizations, 'READ_UPDATE'),
    crudOrganizations: getOrgsForPermission(organizations, 'CRUD'),
  };
  if (userRights.readOrganizations.length === 0 && !userRights.admin) {
    throw Error('Unauthorized');
  }
  return userRights;
};

const queryProps = {
  queryKey: ['getUserPermissions'],
  queryFn: getUserPermissions,
  staleTime: Infinity,
};

export const useQueryUserPermissions = () => useQuery(queryProps);

export const useUserPermissions = () => useSuspenseQuery(queryProps);
