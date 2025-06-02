import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useSuspenseQueries } from '@tanstack/react-query';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';
import { hakukohdeQueryOptions } from '@/lib/kouta/useHakukohde';
import { haunAsetuksetQueryOptions } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { hakukohteenValinnanvaiheetQueryOptions } from '@/lib/valintaperusteet/valintaperusteet-service';
import { userPermissionsQueryOptions } from './useUserPermissions';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { useOrganizationOidPath } from '@/lib/organisaatio-service';
import { VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY } from '@/lib/permissions';
import { getVisibleHakukohdeTabs } from '@/lib/hakukohde-tab-utils';

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

  const { data: organizationOidPath } = useOrganizationOidPath(
    hakukohde.tarjoajaOid ?? hakukohde.organisaatioOid,
  );

  const valinnatPermissions = permissions[VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY];

  return getVisibleHakukohdeTabs({
    haku,
    hakukohde,
    haunAsetukset,
    usesValintalaskenta,
    permissions: valinnatPermissions,
    organizationOidPath,
  });
};
