import { hasHierarchyPermission } from '@/hooks/useUserPermissions';
import { UserPermissions } from '@/lib/permissions';
import { isTruthy } from 'remeda';

export const getVisibleHakuTabs = ({
  hierarchyPermissions,
  tarjoajaOids = [],
  hasValintaryhma = false,
}: {
  hierarchyPermissions: UserPermissions;
  tarjoajaOids?: Array<string>;
  hasValintaryhma?: boolean;
}) => {
  const hasValinnatRead = hasHierarchyPermission(
    tarjoajaOids,
    hierarchyPermissions,
    'READ',
  );

  const hasValinnatCRUD = hasHierarchyPermission(
    tarjoajaOids,
    hierarchyPermissions,
    'CRUD',
  );

  return [
    hasValinnatRead && 'hakukohde',
    hasValinnatRead && 'henkilo',
    hasValintaryhma && hasValinnatCRUD && 'valintaryhma',
    hasValinnatCRUD && 'yhteisvalinnan-hallinta',
  ].filter(isTruthy);
};
