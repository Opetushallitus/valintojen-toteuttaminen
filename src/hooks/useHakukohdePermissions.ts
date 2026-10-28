import { useSuspenseQueries } from '@tanstack/react-query';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import {
  checkHasHakukohdePermission,
  EMPTY_USER_PERMISSIONS,
  isHakukohderyhmaOid,
  Permission,
} from '@/lib/permissions';
import { queryOptionsGetHakukohteet } from '@/lib/kouta/kouta-queries';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from './useUserPermissions';

export const useHakukohdePermissions = (hakukohde: Hakukohde) => {
  const permissions = useUserPermissions();
  const hierarchyPermissions = useHierarchyUserPermissions(permissions);
  const ryhmaOids = permissions.readOrganizations.filter(isHakukohderyhmaOid);
  // Ryhmän hakukohteet haetaan kerran ja tulosta käytetään saman haun
  // muiden hakukohteiden käyttöoikeustarkistuksissa.
  const ryhmaHakukohteet = useSuspenseQueries({
    queries: ryhmaOids.map((oid) =>
      queryOptionsGetHakukohteet(hakukohde.hakuOid, {
        ...EMPTY_USER_PERMISSIONS,
        readOrganizations: [oid],
      }),
    ),
  });
  const hakukohderyhmaOids = ryhmaOids.filter((_, index) =>
    ryhmaHakukohteet[index]?.data.some((kohde) => kohde.oid === hakukohde.oid),
  );

  return {
    hakukohde: { ...hakukohde, hakukohderyhmaOids },
    hierarchyPermissions,
  };
};

export const useCheckHakukohdePermission = (
  hakukohde: Hakukohde,
  permission: Permission,
) => {
  const scoped = useHakukohdePermissions(hakukohde);
  return checkHasHakukohdePermission(
    scoped.hakukohde,
    scoped.hierarchyPermissions,
    permission,
  );
};
