import { usePathname } from '@/hooks/usePathname';
import { BasicTab, HAKUKOHDE_TABS } from '@/lib/hakukohde-tab-utils';
import { isEmptyish } from 'remeda';

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return (
    (!isEmptyish(lastPath) &&
      HAKUKOHDE_TABS.find((tab) => tab.route.startsWith(lastPath))) ||
    (HAKUKOHDE_TABS[0] as BasicTab)
  );
}

export const useHakukohdeTab = () => {
  const pathName = usePathname();
  return getPathMatchingTab(pathName);
};
