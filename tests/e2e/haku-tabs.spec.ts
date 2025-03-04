import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  getHakuNaviLinks,
} from './playwright-utils';

type Tab = {
  title: string;
  route: string;
};

const TABS_TO_TEST: Array<Tab> = [
  {
    title: 'Hakukohteittain',
    route: 'hakukohde',
  },
  {
    title: 'Henkilöittäin',
    route: 'henkilo',
  },
  {
    title: 'Valintaryhmittäin',
    route: 'valintaryhma',
  },
  {
    title: 'Yhteisvalinnan hallinta',
    route: 'yhteisvalinnan-hallinta',
  },
] as const;

for (const tab of TABS_TO_TEST) {
  test(`Navigates to ${tab.title}`, async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
    );

    await getHakuNaviLinks(page).filter({ hasText: tab.title }).click();
    await page.waitForURL(
      (url) =>
        url.pathname ===
        `/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/${tab.route}`,
    );
    await expect(page.getByAltText('virhe')).toBeHidden();
  });

  test(`${tab.title} page accessibility`, async ({ page }) => {
    await page.goto(
      `/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/${tab.route}`,
    );
    await expectAllSpinnersHidden(page);
    await expectPageAccessibilityOk(page);
  });
}
