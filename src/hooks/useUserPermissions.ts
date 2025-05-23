import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { client } from '@/lib/http-client';
import {
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
  Permission,
  selectUserPermissions,
  UserPermissionsByService,
} from '@/lib/permissions';
import { PermissionError } from '@/lib/common';
import { intersection, isEmpty } from 'remeda';
import { useOrganizationParentOids } from '@/lib/organisaatio-service';
import { getConfiguration } from '../lib/configuration/client-configuration';

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
      userPermissions[VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY].readOrganizations,
    )
  ) {
    throw new PermissionError();
  }

  return userPermissions;
};

export const useHasOrganizationPermissions = (
  oid: string | undefined,
  permission: Permission,
  serviceKey?: string,
) => {
  const userPermissions = useUserPermissions(serviceKey);
  const { readOrganizations, writeOrganizations, crudOrganizations } =
    userPermissions;

  let permissionOrganizationOids = readOrganizations;
  if (permission === 'CRUD') {
    permissionOrganizationOids = crudOrganizations;
  } else if (permission === 'READ_UPDATE') {
    permissionOrganizationOids = writeOrganizations;
  }

  const { data: organizationOidWithParentOids } =
    useOrganizationParentOids(oid);

  return (
    intersection(organizationOidWithParentOids, permissionOrganizationOids)
      .length > 0
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
