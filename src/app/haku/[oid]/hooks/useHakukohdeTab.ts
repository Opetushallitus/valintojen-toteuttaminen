import { usePathname } from 'next/navigation';
import { TABS } from '../lib/hakukohde-tab-utils';

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return TABS.find((tab) => tab.route.startsWith(lastPath)) ?? TABS[0];
}

export const useHakukohdeTab = () => {
  const pathName = usePathname();
  return getPathMatchingTab(pathName);
};
