import { useHakuPermissions } from './useHakuPermissions';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useSuspenseQueries } from '@tanstack/react-query';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { getVisibleHakukohdeTabs } from '@/lib/hakukohde-tab-utils';
import {
  queryOptionsGetHakukohde,
  queryOptionsGetHaku,
} from '@/lib/kouta/kouta-queries';
import { queryOptionsGetHakukohteenValinnanvaiheet } from '@/lib/valintaperusteet/valintaperusteet-queries';
import { queryOptionsGetHaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-queries';

export const useVisibleHakukohdeTabs = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
  const [
    { data: haku },
    { data: hakukohde },
    { data: haunAsetukset },
    { data: valinnanvaiheet },
  ] = useSuspenseQueries({
    queries: [
      queryOptionsGetHaku({ hakuOid }),
      queryOptionsGetHakukohde({ hakukohdeOid }),
      queryOptionsGetHaunAsetukset({ hakuOid }),
      queryOptionsGetHakukohteenValinnanvaiheet(hakukohdeOid),
    ],
  });

  const usesValintalaskenta = checkIsValintalaskentaUsed(valinnanvaiheet);

  const hakuPermissions = useHakuPermissions(hakuOid);

  return getVisibleHakukohdeTabs({
    haku,
    hakukohde,
    haunAsetukset,
    usesValintalaskenta,
    hakuPermissions,
  });
};
