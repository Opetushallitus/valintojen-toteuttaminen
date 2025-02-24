import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

test('Valintaryhmittäin saavutettavuus', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('Valintaryhmillä hakeminen', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
  });

  test('Näyttää valintaryhmät listassa', async () => {
    await expect(page.getByText('Valitse valintaryhmä')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeVisible();
  });

  test('Piilottaa ja näyttää haitarin sisällön', async () => {
    await page.getByLabel('Piilota alavalintaryhmät').click();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await page.getByLabel('Näytä alavalintaryhmät').click();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeVisible();
  });

  test('nimellä suodatus', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae valintaryhmiä',
    });
    await hakuInput.fill('TUT');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeHidden();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeVisible();
    await hakuInput.fill('Peruskaav');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeHidden();
  });

  test('Näyttää aina vähintään haun valintaryhmän', async () => {
    await page
      .getByRole('textbox', {
        name: 'Hae valintaryhmiä',
      })
      .fill('Purkkaa ja jesaria');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
  });
});
