import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  getMuiCloseButton,
  mockValintalaskentaRun,
} from './playwright-utils';

test('Näyttää valinnanvaiheet', async ({ page }) => {
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
  await expect.soft(columns.first()).toContainText('Tietojen tulostus');
  await expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  await expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  await expect.soft(columns.nth(3).locator('button')).toBeEnabled();
  columns = rows.nth(1).locator('td');
  await expect.soft(columns.first()).toContainText('Välikoe');
  await expect.soft(columns.nth(1)).toContainText('Ei lasketa');
  await expect.soft(columns.nth(2)).toContainText('Valintakoevalinnanvaihe');
  await expect
    .soft(columns.nth(3))
    .toContainText('Valinnanvaihe ei ole aktiivinen');
  columns = rows.nth(2).locator('td');
  await expect.soft(columns.first()).toContainText('Varsinainen valinta');
  await expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  await expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  await expect.soft(columns.nth(3).locator('button')).toBeEnabled();
});

test('Käynnistää laskennan', async ({ page }) => {
  await mockValintalaskentaRun(page, {
    hakuOid: '1.2.246.562.29.00000000000000045102',
    tyyppi: 'HAKUKOHDE',
    seurantaResponse: {
      json: {
        jonosija: null,
        tila: 'MENEILLAAN',
        hakukohteitaYhteensa: 1,
        hakukohteitaValmiina: 0,
        hakukohteitaKeskeytetty: 0,
        tyyppi: 'HAKUKOHDE',
      },
    },
  });
  await startLaskenta(page);
  await expect(
    page.locator('tbody tr').first().locator('button'),
  ).toBeDisabled();
  const spinners = page.getByRole('progressbar');
  await expect(spinners).toHaveCount(1);
});

test('Näyttää ilmoituksen kun laskenta valmistuu', async ({ page }) => {
  await mockValintalaskentaRun(page, {
    hakuOid: '1.2.246.562.29.00000000000000045102',
    tyyppi: 'HAKUKOHDE',
    seurantaResponse: {
      json: {
        jonosija: null,
        tila: 'VALMIS',
        hakukohteitaYhteensa: 1,
        hakukohteitaValmiina: 1,
        hakukohteitaKeskeytetty: 0,
        tyyppi: 'HAKUKOHDE',
      },
    },
    yhteenvetoResponse: {
      json: {
        tila: 'VALMIS',
        hakukohteet: [
          {
            tila: 'VALMIS',
            hakukohdeOid: '1.2.246.562.20.00000000000000045105',
            ilmoitukset: [],
          },
        ],
      },
    },
  });

  await startLaskenta(page);
  await expect(
    page.getByText('Laskenta suoritettu onnistuneesti'),
  ).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(
    page.getByText('Laskenta suoritettu onnistuneesti'),
  ).toBeHidden();
});

test('Näyttää virheen kun laskennan käynnistäminen epäonnistuu', async ({
  page,
}) => {
  await mockValintalaskentaRun(page, {
    hakuOid: '1.2.246.562.29.00000000000000045102',
    tyyppi: 'HAKUKOHDE',
    startResponse: {
      status: 500,
      body: 'Unknown error',
    },
  });
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
