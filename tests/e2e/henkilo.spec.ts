import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json';

test('Henkiloittain page accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Henkilö-search and navigation works', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo',
  );

  await page.route('**/lomake-editori/api/external/valinta-ui*', (route) => {
    const url = route.request().url();
    switch (true) {
      case url.includes('name=Ruhtinas'):
        return route.fulfill({
          json: HAKENEET.filter((h) => h.etunimet === 'Ruhtinas'),
        });
      case url.includes('henkilotunnus=210988-9151'):
        return route.fulfill({
          json: HAKENEET.filter((h) => h.henkilotunnus === '210988-9151'),
        });
      case url.includes('hakemusOids=1.2.246.562.11.00000000000001793706'):
        return route.fulfill({
          json: HAKENEET.filter(
            (h) => h.oid === '1.2.246.562.11.00000000000001793706',
          ),
        });
      case url.includes('henkiloOid=1.2.246.562.24.30476885816'):
        return route.fulfill({
          json: HAKENEET.filter(
            (h) => h.personOid === '1.2.246.562.24.30476885816',
          ),
        });
      default:
        return route.continue();
    }
  });

  const henkiloSearchInput = page.getByRole('textbox', {
    name: 'Hae henkilöitä',
  });

  const henkiloNavigation = page.getByRole('navigation', {
    name: 'Henkilövalitsin',
  });

  const henkiloLinks = henkiloNavigation.getByRole('link');

  await expect(henkiloNavigation).toBeHidden();

  await Promise.all([
    henkiloSearchInput.fill('210988-9151'),
    page.waitForRequest((request) =>
      request.url().includes('henkilotunnus=210988-9151'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Purukumi Puru'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('1.2.246.562.11.00000000000001793706'),
    page.waitForRequest((request) =>
      request.url().includes('hakemusOids=1.2.246.562.11.00000000000001793706'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Dacula Kreivi'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('1.2.246.562.24.30476885816'),
    page.waitForRequest((request) =>
      request.url().includes('henkiloOid=1.2.246.562.24.30476885816'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Hui Haamu'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('Ruhtinas'),
    page.waitForRequest((request) => request.url().includes('name=Ruhtinas')),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Nukettaja Ruhtinas'),
  ]);

  await henkiloNavigation
    .getByRole('link', { name: 'Nukettaja Ruhtinas' })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Nukettaja Ruhtinas',
    }),
  ).toBeVisible();
});

test('Displays selected henkilö info', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  await expect(
    page.getByRole('heading', {
      name: 'Nukettaja Ruhtinas',
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel('Hakemuksen tekninen tunniste (OID)'),
  ).toHaveText('1.2.246.562.11.00000000000001796027');
  await expect(page.getByLabel('Lähiosoite')).toHaveText(
    'Kuoppamäki 905, 00100',
  );
});
