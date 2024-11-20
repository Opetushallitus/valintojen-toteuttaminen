import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json';
import POSTI_00100 from './fixtures/posti_00100.json';
import HAKEMUKSEN_VALINTALASKENTA_TULOKSET from './fixtures/hakemuksen-valintalaskenta-tulokset.json';
import HAKEMUKSEN_SIJOITTELU_TULOKSET from './fixtures/hakemuksen-sijoittelu-tulokset.json';

test.beforeEach(async ({ page }) => {
  await page.route('**/codeelement/latest/posti_00100', (route) => {
    return route.fulfill({
      json: POSTI_00100,
    });
  });
  await page.route(
    '**/resources/hakemus/1.2.246.562.29.00000000000000045102/1.2.246.562.11.00000000000001796027',
    (route) =>
      route.fulfill({
        json: {
          hakukohteet: [],
        },
      }),
  );
  await page.route(
    '**/sijoittelu/1.2.246.562.29.00000000000000045102/sijoitteluajo/latest/hakemus/1.2.246.562.11.00000000000001796027',
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );
});

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

test('Displays selected henkilö info with hakutoive without valintalaskenta or sijoittelu results', async ({
  page,
}) => {
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
    'Kuoppamäki 905, 00100 HELSINKI',
  );

  await expect(
    page.getByText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
    }),
  ).toBeVisible();

  await expect(page.getByText('Ei valintalaskennan tuloksia')).toBeHidden();
  await page.getByRole('button', { name: 'Näytä hakutoiveen tiedot' }).click();
  await expect(page.getByText('Ei valintalaskennan tuloksia')).toBeVisible();
});

test('Displays selected henkilö hakutoiveet with laskenta and sijoittelu results', async ({
  page,
}) => {
  await page.route(
    '**/resources/hakemus/1.2.246.562.29.00000000000000045102/1.2.246.562.11.00000000000001796027',
    (route) =>
      route.fulfill({
        json: HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
      }),
  );

  await page.route(
    '**/sijoittelu/1.2.246.562.29.00000000000000045102/sijoitteluajo/latest/hakemus/1.2.246.562.11.00000000000001796027',
    (route) => {
      return route.fulfill({
        json: HAKEMUKSEN_SIJOITTELU_TULOKSET,
      });
    },
  );

  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const accordionContent = page.getByLabel(
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(accordionContent).toBeVisible();

  const jonoRows = accordionContent.getByRole('row');

  await expect(jonoRows).toHaveCount(2);

  const firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:54:55',
    '13',
    'Hyväksyttävissä',
    'PERUUNTUNUT',
    'Kesken',
  ]);
  const secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Jono 1Valintalaskenta tehty: 12.11.2024 17:54:48',
    '',
    'Hyväksyttävissä',
    '',
    'Kesken',
  ]);
});

test('Displays selected henkilö hakutoiveet with laskenta results only', async ({
  page,
}) => {
  await page.route(
    '**/resources/hakemus/1.2.246.562.29.00000000000000045102/1.2.246.562.11.00000000000001796027',
    (route) =>
      route.fulfill({
        json: HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
      }),
  );

  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const accordionContent = page.getByLabel(
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  const jonoRows = accordionContent.getByRole('row');
  await expect(jonoRows).toHaveCount(2);

  const firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:54:55',
    '13',
    'Hyväksyttävissä',
    'Ei sijoittelun tuloksia',
  ]);
  const secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Jono 1Valintalaskenta tehty: 12.11.2024 17:54:48',
    '',
    'Hyväksyttävissä',
    'Ei sijoittelun tuloksia',
  ]);
});
