'use client';

import { NoResults } from '@/components/no-results';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import {
  useCheckPermission,
  useUserPermissions,
} from '@/hooks/useUserPermissions';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { useTranslations } from '@/lib/localization/useTranslations';
import { DoNotDisturb } from '@mui/icons-material';
import { HakukohdeReadonlyContext } from '../hakukohde-readonly-context';

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
  const permissions = useUserPermissions();
  const hasCrud = useCheckPermission('CRUD')(hakukohde.tarjoajaOid);
  const hasUpdate = useCheckPermission('READ_UPDATE')(hakukohde.tarjoajaOid);
  const readonly = !permissions.hasOphCRUD && !hasCrud && !hasUpdate;

  return isTabVisible ? (
    <HakukohdeReadonlyContext value={readonly}>
      {children}
    </HakukohdeReadonlyContext>
  ) : (
    <NoResults
      icon={<DoNotDisturb />}
      text={t('hakukohde-tabs.not-visible', { tabName })}
    />
  );
};
