import { test, expect, Page } from '@playwright/test';
import {
  getHakukohdeNaviLinks,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

type Tab = {
  title: string;
  textLocator?: string;
  route: string;
};

const TABS_TO_TEST: Tab[] = [
  {
    title: 'Perustiedot',
    textLocator: 'Valintatapajonot',
    route: 'perustiedot',
  },
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
  {
    title: 'Pistesyöttö',
    textLocator: 'Näytä vain laskentaan vaikuttavat osallistumistiedot',
    route: 'pistesyotto',
  },
  {
    title: 'Hakijaryhmät',
    textLocator: 'Hae hakijan nimellä tai tunnisteilla',
    route: 'hakijaryhmat',
  },
  {
    title: 'Sijoittelun tulokset',
    textLocator:
      '(Aloituspaikat: 1 | Sijoittelun aloituspaikat: 2 | Tasasijasääntö: Arvonta | Varasijatäyttö | Prioriteetti: 0)',
    route: 'sijoittelun-tulokset',
  },
] as const;

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

const checkTabContent = async (page: Page, tab: Tab) => {
  if (tab.textLocator) {
    await expect(page.locator('main').getByText(tab.textLocator)).toBeVisible();
  } else {
    await expect(
      page.getByRole('heading', { level: 3, name: tab.title, exact: true }),
    ).toBeVisible();
  }
};

test.describe('Hakukohde tabs', () => {
  for (const tab of TABS_TO_TEST) {
    test(`Navigates to ${tab.title}`, async ({ page }) => {
      await page.goto(
        '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
      );

      await getHakukohdeNaviLinks(page).first().click();
      await page.getByRole('link', { name: tab.title, exact: true }).click();
      await checkTabContent(page, tab);
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
