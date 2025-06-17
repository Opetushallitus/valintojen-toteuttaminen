import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useSuspenseQueries } from '@tanstack/react-query';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';
import { hakukohdeQueryOptions } from '@/lib/kouta/useHakukohde';
import { haunAsetuksetQueryOptions } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { hakukohteenValinnanvaiheetQueryOptions } from '@/lib/valintaperusteet/valintaperusteet-service';
import {
  useHierarchyUserPermissions,
  userPermissionsQueryOptions,
} from './useUserPermissions';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { getVisibleHakukohdeTabs } from '@/lib/hakukohde-tab-utils';
import { VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY } from '@/lib/permissions';

export const useVisibleHakukohdeTabs = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
  const [
    { data: haku },
    { data: hakukohde },
    { data: haunAsetukset },
    { data: valinnanvaiheet },
    { data: permissions },
  ] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid }),
      hakukohdeQueryOptions({ hakukohdeOid }),
      haunAsetuksetQueryOptions({ hakuOid }),
      hakukohteenValinnanvaiheetQueryOptions(hakukohdeOid),
      userPermissionsQueryOptions,
    ],
  });

  const usesValintalaskenta = checkIsValintalaskentaUsed(valinnanvaiheet);

  const hierarchyPermissions = useHierarchyUserPermissions(
    permissions[VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY]!,
  );

  return getVisibleHakukohdeTabs({
    haku,
    hakukohde,
    haunAsetukset,
    usesValintalaskenta,
    hierarchyPermissions,
  });
};
