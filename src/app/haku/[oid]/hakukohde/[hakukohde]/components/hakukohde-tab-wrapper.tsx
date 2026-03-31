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
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { useHaku } from '@/lib/kouta/useHaku';
import { isToisenAsteenYhteisHaku } from '@/lib/kouta/kouta-service';
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
  const { data: haku } = useHaku({ hakuOid });
  const userPermissions = useUserPermissions();
  const hierarchyPermissions = useHierarchyUserPermissions(userPermissions);

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

  // toisen asteen yhteishakua varten, valintalaskennan-tulokset tabi on readonly ei-OPH käyttäjille
  const isValintalaskennanTuloksetTab =
    activeTab.route === 'valintalaskennan-tulokset';
  const isToisenAsteenYhteisHakuHaku = isToisenAsteenYhteisHaku(haku);
  const isReadonlyForToisenAsteen =
    isValintalaskennanTuloksetTab &&
    isToisenAsteenYhteisHakuHaku &&
    !userPermissions.hasOphCRUD;

  const finalReadonly = hasOnlyRead || isReadonlyForToisenAsteen;

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
