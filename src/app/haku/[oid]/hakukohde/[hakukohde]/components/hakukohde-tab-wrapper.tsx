'use client';

import { NoResults } from '@/components/no-results';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { HakukohdeUseHasReadOnlyContext } from '@/hooks/useHasOnlyHakukohdeReadPermission';
import {
  useUserPermissions,
  useHierarchyUserPermissions,
} from '@/hooks/useUserPermissions';
import { checkHasPermission } from '@/lib/permissions';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';
import { Haku, KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { useHaku } from '@/lib/kouta/useHaku';
import { isToisenAsteenYhteisHaku } from '@/lib/kouta/kouta-service';
import { useTranslations } from '@/lib/localization/useTranslations';
import { queryOptionsGetHakukohteenValinnanvaiheet } from '@/lib/valintaperusteet/valintaperusteet-queries';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { DoNotDisturb } from '@mui/icons-material';
import { useSuspenseQuery } from '@tanstack/react-query';

export const isHakukohdeTabReadOnly = ({
  activeTabRoute,
  haku,
  hasOnlyRead,
  hasOphCRUD,
  usesValintalaskenta,
}: {
  activeTabRoute: string;
  haku: Haku;
  hasOnlyRead: boolean;
  hasOphCRUD: boolean;
  usesValintalaskenta: boolean;
}) => {
  if (hasOnlyRead) {
    return true;
  }

  return (
    activeTabRoute === 'valintalaskennan-tulokset' &&
    isToisenAsteenYhteisHaku(haku) &&
    usesValintalaskenta &&
    !hasOphCRUD
  );
};

export const HakukohdeTabWrapper = ({
  hakuOid,
  hakukohdeOid,
  children,
}: KoutaOidParams & { children: React.ReactNode }) => {
  const activeTab = useHakukohdeTab();

  const { t } = useTranslations();
  const tabName = t(activeTab.title);

  const visibleTabs = useVisibleHakukohdeTabs({ hakuOid, hakukohdeOid });
  const isTabVisible = Boolean(
    visibleTabs.find((tab) => tab.route === activeTab.route),
  );

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });
  const { data: haku } = useHaku({ hakuOid });
  const { data: valinnanvaiheet } = useSuspenseQuery(
    queryOptionsGetHakukohteenValinnanvaiheet(hakukohdeOid),
  );
  const userPermissions = useUserPermissions();
  const hierarchyPermissions = useHierarchyUserPermissions(userPermissions);
  const usesValintalaskenta = checkIsValintalaskentaUsed(valinnanvaiheet);

  const hasCrud = checkHasPermission(
    hakukohde.tarjoajaOid,
    hierarchyPermissions,
    'CRUD',
  );
  const hasUpdate = checkHasPermission(
    hakukohde.tarjoajaOid,
    hierarchyPermissions,
    'READ_UPDATE',
  );
  const hasOnlyRead = !hasCrud && !hasUpdate;
  const finalReadonly = isHakukohdeTabReadOnly({
    activeTabRoute: activeTab.route,
    haku,
    hasOnlyRead,
    hasOphCRUD: userPermissions.hasOphCRUD,
    usesValintalaskenta,
  });

  return isTabVisible ? (
    <HakukohdeUseHasReadOnlyContext value={finalReadonly}>
      {children}
    </HakukohdeUseHasReadOnlyContext>
  ) : (
    <NoResults
      icon={<DoNotDisturb />}
      text={t('hakukohde-tabs.not-visible', { tabName })}
    />
  );
};
