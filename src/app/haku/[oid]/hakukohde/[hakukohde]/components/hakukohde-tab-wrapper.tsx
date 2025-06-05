'use client';

import { NoResults } from '@/components/no-results';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
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

  return isTabVisible ? (
    children
  ) : (
    <NoResults
      icon={<DoNotDisturb />}
      text={t('hakukohde-tabs.not-visible', { tabName })}
    />
  );
};
