import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '../lib/http-client';
import { configuration } from '../lib/configuration';
import {
  RightToOrganization,
  UserRights,
  AUTH_SERVICE,
  RIGHT,
  getOrgsForRight,
} from '../lib/auth';

export const getUserRights = async (): Promise<UserRights> => {
  const response = await client.get(configuration.kayttoikeusUrl);
  if (!response.data) {
    throw Error('Unable to get user data');
  }
  const organizations: RightToOrganization[] = response.data.organisaatiot
    .map(
      (o: {
        organisaatioOid: string;
        kayttooikeudet: [{ palvelu: string; oikeus: RIGHT }];
      }) => {
        const rights: RIGHT[] = o.kayttooikeudet
          .filter((o) => o.palvelu === AUTH_SERVICE)
          .map((o) => o.oikeus);
        return rights.length > 0
          ? { organizationOid: o.organisaatioOid, rights }
          : null;
      },
    )
    .filter((o: RightToOrganization | null) => o !== null);
  const userRights: UserRights = {
    admin: response.data.isAdmin,
    readOrganizations: getOrgsForRight(organizations, 'READ'),
    writeOrganizations: getOrgsForRight(organizations, 'READ_UPDATE'),
    crudOrganizations: getOrgsForRight(organizations, 'CRUD'),
  };
  if (userRights.readOrganizations.length < 1 && !userRights.admin) {
    throw Error('Unauthorized');
  }
  return userRights;
};

const queryProps = {
  queryKey: ['getUserRights'],
  queryFn: getUserRights,
  staleTime: Infinity,
};

export const useQueryUserRights = () => useQuery(queryProps);

export const useUserData = () => useSuspenseQuery(queryProps);
