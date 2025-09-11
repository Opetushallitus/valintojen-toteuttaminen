'use client';

import { NoResults } from '@/components/no-results';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { HakukohdeUseHasReadOnlyContext } from '@/hooks/useHasOnlyHakukohdeReadPermission';
import { useCheckPermission } from '@/hooks/useUserPermissions';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { useTranslations } from '@/lib/localization/useTranslations';
import { DoNotDisturb } from '@mui/icons-material';

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
  const hasCrud = useCheckPermission('CRUD')(hakukohde.tarjoajaOid);
  const hasUpdate = useCheckPermission('READ_UPDATE')(hakukohde.tarjoajaOid);
  const hasOnlyRead = !hasCrud && !hasUpdate;

  return isTabVisible ? (
    <HakukohdeUseHasReadOnlyContext value={hasOnlyRead}>
      {children}
    </HakukohdeUseHasReadOnlyContext>
  ) : (
    <NoResults
      icon={<DoNotDisturb />}
      text={t('hakukohde-tabs.not-visible', { tabName })}
    />
  );
};
