import { usePathname } from 'next/navigation';
import { HAKUKOHDE_TABS } from '@/lib/hakukohde-tab-utils';

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return (
    HAKUKOHDE_TABS.find((tab) => tab.route.startsWith(lastPath)) ??
    HAKUKOHDE_TABS[0]
  );
}

export const useHakukohdeTab = () => {
  const pathName = usePathname();
  return getPathMatchingTab(pathName);
};
