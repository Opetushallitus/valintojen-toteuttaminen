import { uniqueBy } from 'remeda';
import { useCallback, useMemo } from 'react';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import {
  checkHasHakukohdePermission,
  EMPTY_USER_PERMISSIONS,
  HakukohdePermission,
  HakuPermissions,
  selectOrganizationsOidsByPermission,
} from '@/lib/permissions';
import { isHakukohderyhmaOid } from '@/lib/common';
import { queryOptionsGetHakukohteet } from '@/lib/kouta/kouta-queries';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from './useUserPermissions';

const PERMISSION_LEVELS = ['READ', 'READ_UPDATE', 'CRUD'] as const;
const EMPTY_HAKUKOHTEET: Array<Hakukohde> = [];

export const useHakuPermissions = (hakuOid: string): HakuPermissions => {
  const permissions = useUserPermissions();
  const userPermissions = useHierarchyUserPermissions(permissions);
  // Kunkin oikeustason kaikki ryhmät haetaan yhdessä. Samat ryhmärajaukset
  // käyttävät samaa kyselyä myös eri oikeustasoilla ja eri näkymissä.
  const ryhmaSets = PERMISSION_LEVELS.map((permission) =>
    selectOrganizationsOidsByPermission(permissions, permission)
      .filter(isHakukohderyhmaOid)
      .toSorted(),
  );
  const queryRyhmaSets = uniqueBy(
    ryhmaSets.filter((oids) => oids.length > 0),
    (oids) => oids.join(','),
  );
  const results = useSuspenseQueries({
    queries: queryRyhmaSets.map((oids) =>
      queryOptionsGetHakukohteet(hakuOid, {
        ...EMPTY_USER_PERMISSIONS,
        readOrganizations: oids,
      }),
    ),
  });
  const [
    read = EMPTY_HAKUKOHTEET,
    write = EMPTY_HAKUKOHTEET,
    crud = EMPTY_HAKUKOHTEET,
  ] = ryhmaSets.map((oids) => {
    const index = queryRyhmaSets.findIndex(
      (queryOids) => queryOids.join(',') === oids.join(','),
    );
    return results[index]?.data ?? EMPTY_HAKUKOHTEET;
  });

  return useMemo(
    () => ({
      hakuOid,
      userPermissions,
      hakukohderyhmaPermissions: {
        READ: read.map((hakukohde) => hakukohde.oid),
        READ_UPDATE: write.map((hakukohde) => hakukohde.oid),
        CRUD: crud.map((hakukohde) => hakukohde.oid),
      },
    }),
    [hakuOid, userPermissions, read, write, crud],
  );
};

export const useCheckHakukohdePermission = (
  hakuOid: string,
  permission: HakukohdePermission,
) => {
  const permissions = useHakuPermissions(hakuOid);
  return useCallback(
    (hakukohde: Pick<Hakukohde, 'oid' | 'hakuOid' | 'tarjoajaOid'>) =>
      checkHasHakukohdePermission(hakukohde, permissions, permission),
    [permissions, permission],
  );
};
