import { test, expect, Page } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';

test('displays hakijaryhmat', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const headrow = page.locator(
    '#ensikertalaiset-hakijaryhma-oid-accordion-content thead:first-child tr',
  );
  await checkRow(
    headrow,
    [
      'Hakija',
      'Kuuluu hakijaryhmään',
      'Sijoittelun tila',
      'Hyväksytty hakijaryhmästä',
      'Pisteet',
      'Vastaanottotila',
    ],
    'th',
  );
  const rows = page.locator(
    '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
  );
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Nukettaja Ruhtinas',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
    'Kyllä',
    '100',
    'KESKEN',
  ]);
  await checkRow(rows.nth(1), [
    'Dacula Kreivi',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(1)',
    'Kyllä',
    '78',
    'KESKEN',
  ]);
  await checkRow(rows.nth(2), [
    'Purukumi Puru',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
    'Kyllä',
    '49',
    'KESKEN',
  ]);
  await checkRow(rows.nth(3), [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Kyllä',
    '0',
    'KESKEN',
  ]);
  const rows2 = page.locator(
    '#ensikertalaiset-hakijaryhma-oid2-accordion-content tbody tr',
  );
  await expect(rows2).toHaveCount(4);
  await checkRow(rows2.nth(0), [
    'Nukettaja Ruhtinas',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
    'Kyllä',
    '100',
    'KESKEN',
  ]);
  await checkRow(rows2.nth(1), [
    'Dacula Kreivi',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(1)',
    'Ei',
    '78',
    'KESKEN',
  ]);
  await checkRow(rows2.nth(2), [
    'Purukumi Puru',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
    'Ei',
    '49',
    'KESKEN',
  ]);
  await checkRow(rows2.nth(3), [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Ei',
    '0',
    'KESKEN',
  ]);
});

test('sorts list by sijoittelun tila when header clicked', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
  );
  await expectAllSpinnersHidden(page);
  const tilaHeader = page
    .getByRole('columnheader', { name: 'Sijoittelun tila' })
    .first();
  await tilaHeader.getByRole('button').click();
  await expect(tilaHeader).toHaveAttribute('aria-sort', 'ascending');

  let rows = page.locator(
    '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
  );
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Nukettaja Ruhtinas',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
    'Kyllä',
    '100',
    'KESKEN',
  ]);
  await checkRow(rows.nth(1), [
    'Dacula Kreivi',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(1)',
    'Kyllä',
    '78',
    'KESKEN',
  ]);
  await checkRow(rows.nth(2), [
    'Purukumi Puru',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
    'Kyllä',
    '49',
    'KESKEN',
  ]);
  await checkRow(rows.nth(3), [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Kyllä',
    '0',
    'KESKEN',
  ]);

  await tilaHeader.getByRole('button').click();

  await expect(tilaHeader).toHaveAttribute('aria-sort', 'descending');

  rows = page.locator(
    '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
  );
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Kyllä',
    '0',
    'KESKEN',
  ]);
  await checkRow(rows.nth(1), [
    'Purukumi Puru',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
    'Kyllä',
    '49',
    'KESKEN',
  ]);
  await checkRow(rows.nth(2), [
    'Dacula Kreivi',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA(1)',
    'Kyllä',
    '78',
    'KESKEN',
  ]);
  await checkRow(rows.nth(3), [
    'Nukettaja Ruhtinas',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
    'Kyllä',
    '100',
    'KESKEN',
  ]);
});

test.describe('filters', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
    );
    await expectAllSpinnersHidden(page);
  });

  test('filters by name', async () => {
    const hakuInput = page.locator('#hakijaryhmat-search');
    await hakuInput.fill('Ruht');
    let rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Nukettaja Ruhtinas',
      'Kyllä',
      'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
      'Kyllä',
      '100',
      'KESKEN',
    ]);
    await hakuInput.fill('Hui');
    rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei',
      'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
      'Kyllä',
      '0',
      'KESKEN',
    ]);
  });

  test('filters by application oid', async () => {
    const hakuInput = page.locator('#hakijaryhmat-search');
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei',
      'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
      'Kyllä',
      '0',
      'KESKEN',
    ]);
  });

  test('filters henkiloOid', async () => {
    const hakuInput = page.locator('#hakijaryhmat-search');
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Purukumi Puru',
      'Kyllä',
      'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
      'Kyllä',
      '49',
      'KESKEN',
    ]);
  });

  test('filters by sijoittelutila hylätty', async () => {
    await selectTila(page, 'HYLÄTTY');
    const rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei',
      'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
      'Kyllä',
      '0',
      'KESKEN',
    ]);
  });

  test('filters by sijoittelutila varalla', async () => {
    await selectTila(page, 'VARALLA');
    const rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(2);
    await checkRow(rows.nth(0), [
      'Dacula Kreivi',
      'Kyllä',
      'Valintatapajono: Todistusvalinta (YO)VARALLA(1)',
      'Kyllä',
      '78',
      'KESKEN',
    ]);
    await checkRow(rows.nth(1), [
      'Purukumi Puru',
      'Kyllä',
      'Valintatapajono: Todistusvalinta (YO)VARALLA(2)',
      'Kyllä',
      '49',
      'KESKEN',
    ]);
  });

  test('filters by kuuluu hakijaryhmaan', async () => {
    await selectKuuluuRyhmaan(page, 'Kyllä');
    let rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(3);
    await selectKuuluuRyhmaan(page, 'Ei');
    rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei',
      'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
      'Kyllä',
      '0',
      'KESKEN',
    ]);
  });

  test('filters by hyvaksytty hakijaryhmasta', async () => {
    await selectHyvaksytty(page, 'Kyllä');
    let rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(4);
    rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid2-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(1);
    await selectHyvaksytty(page, 'Ei');
    rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(0);
    rows = page.locator(
      '#ensikertalaiset-hakijaryhma-oid2-accordion-content tbody tr',
    );
    await expect(rows).toHaveCount(3);
  });
});

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

async function selectKuuluuRyhmaan(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', {
    name: 'Kuuluu hakijaryhmään',
  });
  await combobox.click();
  const listbox = page.getByRole('listbox', {
    name: 'Kuuluu hakijaryhmään',
  });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}

async function selectHyvaksytty(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', {
    name: 'Hyväksytty hakijaryhmästä',
  });
  await combobox.click();
  const listbox = page.getByRole('listbox', {
    name: 'Hyväksytty hakijaryhmästä',
  });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}
