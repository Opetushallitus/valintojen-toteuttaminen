import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import { BasicTab } from '@/app/haku/[oid]/hakukohde/[hakukohde]/hakukohde-tabs';

const TABS_TO_TEST: BasicTab[] = [
  { title: 'Hakeneet', route: 'hakeneet' },
  { title: 'Valinnan hallinta', route: 'valinnan-hallinta' },
  { title: 'Valintakoekutsut', route: 'valintakoekutsut' },
  { title: 'Pistesyöttö', route: 'pistesyotto' },
  { title: 'Harkinnanvaraiset', route: 'harkinnanvaraiset' },
  { title: 'Hakijaryhmät', route: 'hakijaryhmat' },
  { title: 'Valintalaskennan tulos', route: 'valintalaskennan-tulos' },
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
  await expect(page.locator('.organizationLabel')).toHaveCount(3);
  await page.locator('.organizationLabel').first().click();
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
      await page.locator('.organizationLabel').first().click();
      await page.getByText(tab.title).click();
      await expect(page.locator('h3')).toHaveText(tab.title);
    });

    test(`Navigates directly to ${tab.title}`, async ({ page }) => {
      await page.goto(
        `/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/${tab.route}`,
      );
      await expect(page.locator('h3')).toHaveText(tab.title);
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
