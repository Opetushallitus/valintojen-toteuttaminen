import { checkHasPermission, UserPermissions } from '@/lib/permissions';
import { isTruthy } from 'remeda';

export const getVisibleHakuTabs = ({
  hierarchyPermissions,
  tarjoajaOids = [],
  hasValintaryhma = false,
  valintojenToteuttaminenAllowed = true,
}: {
  hierarchyPermissions: UserPermissions;
  tarjoajaOids?: Array<string>;
  hasValintaryhma?: boolean;
  valintojenToteuttaminenAllowed?: boolean;
}) => {
  const hasValinnatRead = checkHasPermission(
    tarjoajaOids,
    hierarchyPermissions,
    'READ',
  );

  const hasValinnatCRUD = checkHasPermission(
    tarjoajaOids,
    hierarchyPermissions,
    'CRUD',
  );

  return [
    hasValinnatRead && valintojenToteuttaminenAllowed && 'hakukohde',
    hasValinnatRead && valintojenToteuttaminenAllowed && 'henkilo',
    hasValintaryhma && hasValinnatCRUD && 'valintaryhma',
    hasValinnatCRUD && 'yhteisvalinnan-hallinta',
  ].filter(isTruthy);
};
