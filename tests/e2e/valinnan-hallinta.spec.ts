import { test, expect, Page } from '@playwright/test';
import { expectAllSpinnersHidden } from './playwright-utils';

test('displays valinnanvaiheet', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valinnan-hallinta',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(3);
  let columns = rows.first().locator('td');
  await expect(columns).toHaveCount(4);
  expect.soft(columns.first()).toContainText('Tietojen tulostus');
  expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  expect.soft(columns.nth(3).locator('button')).toBeEnabled();
  columns = await rows.nth(1).locator('td');
  await expect.soft(columns.first()).toContainText('Välikoe');
  expect.soft(columns.nth(1)).toContainText('Ei lasketa');
  expect.soft(columns.nth(2)).toContainText('Valintakoevalinnanvaihe');
  expect.soft(columns.nth(3)).toContainText('Valinnanvaihe ei ole aktiivinen');
  columns = await rows.nth(2).locator('td');
  await expect.soft(columns.first()).toContainText('Varsinainen valinta');
  expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  expect.soft(columns.nth(3).locator('button')).toBeEnabled();
});

test('starts laskenta', async ({ page }) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000045102/tyyppi/HAKUKOHDE/whitelist/true**',
    async (route) => {
      const started = {
        lisatiedot: {
          luotiinkoUusiLaskenta: true,
        },
        latausUrl: '12345abs',
      };
      await route.fulfill({
        body: JSON.stringify(started),
        contentType: 'json',
      });
    },
  );
  await page.route(
    '*/**//valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345abs`',
    async (route) => {
      const seuranta = {
        tila: 'MENEILLAAN',
        hakukohteitaYhteensa: 1,
        hakukohteitaValmiina: 0,
        hakukohteitaKeskeytetty: 0,
      };
      await route.fulfill({
        body: JSON.stringify(seuranta),
        contentType: 'json',
      });
    },
  );
  await startLaskenta(page);
  await expect(
    page.locator('tbody tr').first().locator('button'),
  ).toBeDisabled();
  const spinners = page.getByRole('progressbar');
  await expect(spinners).toHaveCount(1);
});

test('starting laskenta causes error', async ({ page }) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000045102/tyyppi/HAKUKOHDE/whitelist/true**',
    async (route) => {
      await route.fulfill({ status: 500, body: 'Unknown error' });
    },
  );
  await startLaskenta(page);
  const error = page.getByText(
    'Laskenta epäonnistui. Yritä myöhemmin uudelleen',
  );
  await expect(error).toBeVisible();
  await page.getByRole('button', { name: 'Näytä virhe' }).click();
  const specificError = page.getByText('Unknown error');
  await expect(specificError).toBeVisible();
});

const startLaskenta = async (page: Page) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valinnan-hallinta',
  );
  await expectAllSpinnersHidden(page);
  await page.locator('tbody tr').first().locator('button').click();
  //click confirm
  await page.locator('tbody tr').first().locator('button').last().click();
};
