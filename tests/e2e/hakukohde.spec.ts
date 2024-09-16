import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  getHakukohdeNaviLinks,
} from './playwright-utils';

type Tab = {
  title: string;
  textLocator?: string;
  route: string;
  invisibleInTabsForKKHaku?: boolean;
};

const TABS_TO_TEST: Tab[] = [
  {
    title: 'Hakeneet',
    textLocator: 'Hae hakijan nimellä tai tunnisteilla',
    route: 'hakeneet',
  },
  {
    title: 'Valinnan hallinta',
    textLocator: 'Valinnanvaiheen nimi',
    route: 'valinnan-hallinta',
  },
  { title: 'Valintakoekutsut', route: 'valintakoekutsut' },
  {
    title: 'Pistesyöttö',
    textLocator: 'Näytä vain laskentaan vaikuttavat osallistumistiedot',
    route: 'pistesyotto',
  },
  {
    title: 'Harkinnanvaraiset',
    route: 'harkinnanvaraiset',
    invisibleInTabsForKKHaku: true,
  },
  {
    title: 'Hakijaryhmät',
    textLocator: 'Hae hakijan nimellä tai tunnisteilla',
    route: 'hakijaryhmat',
  },
  { title: 'Sijoittelun tulokset', route: 'sijoittelun-tulokset' },
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});

test('navigates to hakukohde tabs', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const hakukohdeNavItems = getHakukohdeNaviLinks(page);
  await expect(hakukohdeNavItems).toHaveCount(3);
  await hakukohdeNavItems.first().click();
  await expect(page.locator('span.organisaatioLabel')).toHaveText(
    'Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
  );
  await expect(page.locator('span.hakukohdeLabel')).toHaveText(
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );
  await expect(page.locator('h3')).toHaveText('Valintatapajonot');
});

test('Hakukohde-page accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/perustiedot',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('Hakukohde tabs', () => {
  for (const tab of TABS_TO_TEST) {
    test(`Navigates to ${tab.title}`, async ({ page }) => {
      await page.goto(
        '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
      );

      await getHakukohdeNaviLinks(page).first().click();
      if (tab.invisibleInTabsForKKHaku) {
        await expect(page.getByText(tab.title)).toBeHidden();
      } else {
        await page.getByText(tab.title).click();
        if (tab.textLocator) {
          await expect(page.locator('body')).toContainText(tab.textLocator);
        } else {
          await expect(page.locator('h3')).toHaveText(tab.title);
        }
      }
    });

    test(`Navigates directly to ${tab.title}`, async ({ page }) => {
      await page.goto(
        `/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/${tab.route}`,
      );
      if (tab.textLocator) {
        await expect(page.locator('body')).toContainText(tab.textLocator);
      } else {
        await expect(page.locator('h3')).toHaveText(tab.title);
      }
    });

    test(`${tab.title} page accessibility`, async ({ page }) => {
      await page.goto(
        `/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/${tab.route}`,
      );
      await expectAllSpinnersHidden(page);
      await expectPageAccessibilityOk(page);
    });
  }
});
