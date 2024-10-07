import { test, expect, Page } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';

test.beforeEach(async ({ page }) => await goToSijoittelunTulokset(page));

test('displays sijoittelun tulokset', async ({ page }) => {
  await expect(
    page
      .locator('main')
      .getByText(
        '(Aloituspaikat: 1 | Sijoittelun aloituspaikat: 2 | Tasasijasääntö: Arvonta | Varasijatäyttö | Prioriteetti: 0)',
      ),
  ).toBeVisible();
  await expect(
    page
      .locator('main')
      .getByText(
        '(Aloituspaikat: 1 | Sijoittelun aloituspaikat: 1 | Tasasijasääntö: Ylitäyttö | Varasijatäyttö | Prioriteetti: 1)',
      ),
  ).toBeVisible();
  const firstTable = page
    .getByLabel('Todistusvalinta (YO)(')
    .locator('div')
    .filter({ hasText: 'JonosijaHakijaHakutoivePisteetSijoittelun' })
    .first();
  const headrow = firstTable.locator('thead tr');
  await checkRow(
    headrow,
    [
      'Jonosija',
      'Hakija',
      'Hakutoive',
      'Pisteet',
      'Sijoittelun tila',
      'Vastaanottotieto',
      'Ilmoittautumistieto',
      'Maksun tila',
      'Toiminnot',
    ],
    'th',
  );
  const rows = firstTable.locator('tbody tr');
  await expect(rows).toHaveCount(3);
  await checkRow(
    rows.nth(0),
    [
      '1',
      'Nukettaja Ruhtinas',
      '0',
      '100',
      'HYVÄKSYTTY',
      'Vastaanottanut sitovasti',
      'Läsnä (koko lukuvuosi)',
    ],
    'td',
    false,
  );
  await checkRow(
    rows.nth(1),
    [
      '2',
      'Dacula Kreivi',
      '0',
      '78',
      'HYVÄKSYTTY',
      'Vastaanottanut sitovasti',
      'Läsnä syksy, poissa kevät',
      'Maksamatta',
    ],
    'td',
    false,
  );
  await checkRow(
    rows.nth(2),
    ['3', 'Purukumi Puru', '0', '49', 'VARALLA(1)', 'Julkaistavissa'],
    'td',
    false,
  );

  const secondTable = page
    .getByLabel('Todistusvalinta (AMM)(')
    .locator('div')
    .filter({ hasText: 'JonosijaHakijaHakutoivePisteetSijoittelun' })
    .first();
  const rows2nd = secondTable.locator('tbody tr');
  await expect(rows2nd).toHaveCount(1);
  await checkRow(
    rows2nd.nth(0),
    ['', 'Hui Haamu', '0', '0', 'HYLÄTTY'],
    'td',
    false,
  );
});

test.describe('filters', () => {
  test('filters by name', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    let rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['1', 'Nukettaja Ruhtinas']);
    await hakuInput.fill('Dac');
    rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['2', 'Dacula Kreivi']);
  });

  test('filters by application oid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', 'Hui Haamu']);
  });

  test('filters henkiloOid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['3', 'Purukumi Puru']);
  });

  test('filters by julkaisutila VARALLA', async ({ page }) => {
    await selectTila(page, 'VARALLA');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['3', 'Purukumi Puru']);
  });

  test('filters by julkaisutila HYLÄTTY', async ({ page }) => {
    await selectTila(page, 'HYLÄTTY');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', 'Hui Haamu']);
  });
});

async function goToSijoittelunTulokset(page: Page) {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/sijoittelun-tulokset',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
}

async function selectTila(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', {
    name: 'Sijoittelun tila',
  });
  await combobox.click();
  const listbox = page.getByRole('listbox', {
    name: 'Sijoittelun tila',
  });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}
