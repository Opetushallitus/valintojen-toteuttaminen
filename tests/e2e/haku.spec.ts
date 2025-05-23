import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  getHakukohdeNaviLinks,
} from './playwright-utils';

test('Haku-sivun saavutettavuus', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('Hakukohde suodatin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
    );
  });

  test('Suodattaa nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Natural Sciences');
    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Natural Sciences and Mathematics',
    );
    await hakuInput.fill('Sustainable Urban');
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });

  test('Suodattaa järjestäjän nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Tekniikan ja luonnontieteiden tiedekunta');
    await expect(getHakukohdeNaviLinks(page)).toHaveCount(2);
  });

  test('Suodattaa hakukohteenoidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('1.2.246.562.20.00000000000000045104');

    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Computing and Electrical Engineering',
    );
  });

  test('Suodattaa "On valintakoe"-tiedolla', async ({ page }) => {
    await page.getByRole('button', { name: 'Lisää hakuehtoja' }).click();
    await page.getByLabel('On valintakoe').click();

    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });
});
