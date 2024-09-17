import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  getMuiCloseButton,
} from './playwright-utils';

test('displays pistesyotto', async ({ page }) => {
  await goToPisteSyotto(page);
  const headrow = page.locator('[data-test-id="pistesyotto-form"] thead tr');
  await checkRow(headrow, ['Hakija', 'Nakkikoe, oletko nakkisuojassa?'], 'th');
  const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
  await checkRow(rows.nth(1), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  await checkRow(rows.nth(2), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
  await checkRow(rows.nth(3), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
});

test('displays pistesyotto with all exams', async ({ page }) => {
  await goToPisteSyotto(page);
  await page.getByLabel('Näytä vain laskentaan').click();
  const headrow = page.locator('[data-test-id="pistesyotto-form"] thead tr');
  await checkRow(
    headrow,
    ['Hakija', 'Nakkikoe, oletko nakkisuojassa?', 'Köksäkokeen arvosana'],
    'th',
  );
  const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Dacula Kreivi',
    'EiOsallistui',
    'Merkitsemättä',
  ]);
  await checkRow(rows.nth(1), [
    'Hui Haamu',
    'Valitse...Merkitsemättä',
    'Ei osallistunut',
  ]);
  await checkRow(rows.nth(2), [
    'Nukettaja Ruhtinas',
    'KylläOsallistui',
    'Osallistui',
  ]);
  await checkRow(rows.nth(3), [
    'Purukumi Puru',
    'Valitse...Merkitsemättä',
    'Ei osallistunut',
  ]);
});

test('shows success toast when updating value', async ({ page }) => {
  await goToPisteSyotto(page);
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        contentType: '',
        status: 204,
      }),
  );
  const huiRow = page.getByRole('row', { name: 'Hui Haamu Valitse' });
  await huiRow.getByLabel('Valitse...').click();
  await page.getByRole('option', { name: 'Kyllä' }).click();
  await huiRow.getByLabel('Merkitsemättä').click();
  await page.getByRole('option', { name: 'Osallistui' }).click();
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(page.getByText('Tiedot tallennettu.')).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(page.getByText('Tiedot tallennettu.')).toBeHidden();
});

test('shows error toast when updating value', async ({ page }) => {
  await goToPisteSyotto(page);
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      }),
  );
  await page
    .getByRole('row', { name: 'Hui Haamu Valitse' })
    .getByLabel('Valitse...')
    .click();
  await page.getByRole('option', { name: 'Kyllä' }).click();
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(
    page.getByText('Tietojen tallentamisessa tapahtui virhe.'),
  ).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(
    page.getByText('Tietojen tallentamisessa tapahtui virhe.'),
  ).toBeHidden();
});

test('navigating to another view without saving changes asks for confirmation', async ({
  page,
}) => {
  await goToPisteSyotto(page);
  const huiRow = page.getByRole('row', { name: 'Hui Haamu Valitse' });
  await huiRow.getByLabel('Valitse...').click();
  await page.getByRole('option', { name: 'Kyllä' }).click();
  await page.getByText('Hakijaryhmät').click();
  const confirmationQuestion = () =>
    page.getByText(
      'Olet poistumassa lomakkeelta jolla on tallentamattomia muutoksia. Jatketaanko silti?',
    );
  await expect(confirmationQuestion()).toBeVisible();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(confirmationQuestion()).toBeHidden();
  await expect(page).toHaveURL(/.*pistesyotto/);
  await page.getByText('Hakeneet').click();
  await expect(confirmationQuestion()).toBeVisible();
  await page.getByRole('button', { name: 'Jatka' }).click();
  await expect(confirmationQuestion()).toBeHidden();
  await expect(page).toHaveURL(/.*hakeneet/);
});

test.describe('filters', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPisteSyotto(page);
  });

  test('filters by name', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    let rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
    await hakuInput.fill('Hui');
    rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  });

  test('filters by application oid', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  });

  test('filters henkiloOid', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('filters by osallistumisentila Merkitsemättä', async () => {
    await selectTila(page, 'Merkitsemättä');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
    await checkRow(rows.nth(1), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('filters by osallistumisentila Osallistui', async () => {
    await selectTila(page, 'Osallistui');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);

    await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
    await checkRow(rows.nth(1), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
  });
});

async function selectTila(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', {
    name: 'Tila',
  });
  await combobox.click();
  const listbox = page.getByRole('listbox', {
    name: 'Tila',
  });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}

async function goToPisteSyotto(page: Page) {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/pistesyotto',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
}
