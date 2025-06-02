import { test, expect, Page, Locator } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  selectOption,
} from './playwright-utils';

const ROWS = {
  ruhtinas: [
    'Nukettaja Ruhtinas',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)HYVÄKSYTTY',
    'Kyllä',
    '100',
    'KESKEN',
  ],
  kreiviTable1: [
    'Dacula Kreivi',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA (1)',
    'Kyllä',
    '78',
    'KESKEN',
  ],
  kreiviTable2: [
    'Dacula Kreivi',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)VARALLA (1)',
    'Ei',
    '78',
    'KESKEN',
  ],
  purukumiTable1: [
    'Purukumi Puru',
    'Kyllä',
    'Valintatapajono: Todistusvalinta (YO)VARALLA (2)',
    'Kyllä',
    '49',
    'KESKEN',
  ],
  purukumiTable2: [
    'Purukumi Puru',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)VARALLA (2)',
    'Ei',
    '49',
    'KESKEN',
  ],
  haamuTable1: [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Kyllä',
    '0',
    'KESKEN',
  ],
  haamuTable2: [
    'Hui Haamu',
    'Ei',
    'Valintatapajono: Todistusvalinta (YO)HYLÄTTY',
    'Ei',
    '0',
    'KESKEN',
  ],
};

const getYoAccordionContent = (page: Page) => {
  return page.getByRole('region', {
    name: 'Hakijaryhmä: Ensikertalaiset, Todistusvalinta (YO)',
  });
};

const getAmmAccordionContent = (page: Page) => {
  return page.getByRole('region', {
    name: 'Hakijaryhmä: Ensikertalaiset, Todistusvalinta (AMM)',
  });
};

const assertRows = async (
  rows: Locator,
  contentToExpect: Array<Array<string>>,
) => {
  await expect(rows).toHaveCount(contentToExpect.length);
  for (const [index, content] of contentToExpect.entries()) {
    await checkRow(rows.nth(index), content);
  }
};

test('Näyttää hakijaryhmät', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
  );
  await expectAllSpinnersHidden(page);

  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );

  const accordion1Content = getYoAccordionContent(page);
  const headrow = accordion1Content.locator('thead:first-child tr');

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

  const rows = accordion1Content.locator(' tbody tr');
  await assertRows(rows, [
    ROWS.ruhtinas,
    ROWS.kreiviTable1,
    ROWS.purukumiTable1,
    ROWS.haamuTable1,
  ]);

  const accordion2Content = getAmmAccordionContent(page);
  const rows2 = accordion2Content.locator('tbody tr');
  await assertRows(rows2, [
    ROWS.ruhtinas,
    ROWS.kreiviTable2,
    ROWS.purukumiTable2,
    ROWS.haamuTable2,
  ]);
});

test('Järjestää listan sijoittelun tilan mukaan', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
  );
  await expectAllSpinnersHidden(page);
  const tilaHeader = page
    .getByRole('columnheader', { name: 'Sijoittelun tila' })
    .first();
  await tilaHeader.getByRole('button').click();
  await expect(tilaHeader).toHaveAttribute('aria-sort', 'ascending');

  const accordion1Content = getYoAccordionContent(page);
  const rows = accordion1Content.locator('tbody tr');

  await assertRows(rows, [
    ROWS.ruhtinas,
    ROWS.kreiviTable1,
    ROWS.purukumiTable1,
    ROWS.haamuTable1,
  ]);

  await tilaHeader.getByRole('button').click();

  await expect(tilaHeader).toHaveAttribute('aria-sort', 'descending');

  await assertRows(rows, [
    ROWS.haamuTable1,
    ROWS.purukumiTable1,
    ROWS.kreiviTable1,
    ROWS.ruhtinas,
  ]);
});

test.describe('Suodattimet', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakijaryhmat',
    );
    await expectAllSpinnersHidden(page);
  });

  test('Suodattaa nimellä', async () => {
    const hakuInput = page.getByLabel('Hae hakijan nimellä tai');
    await hakuInput.fill('Ruht');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await assertRows(rows, [ROWS.ruhtinas]);
    await hakuInput.fill('Hui');
    await assertRows(rows, [ROWS.haamuTable1]);
  });

  test('Suodattaa hakemusoidilla', async () => {
    const hakuInput = page.getByLabel('Hae hakijan nimellä tai');
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await assertRows(rows, [ROWS.haamuTable1]);
  });

  test('Suodattaa henkilöoidilla', async () => {
    const hakuInput = page.getByLabel('Hae hakijan nimellä tai');
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await assertRows(rows, [ROWS.purukumiTable1]);
  });

  test('Suodattaa sijoitteluntilalla HYLÄTTY', async () => {
    await selectTila(page, 'HYLÄTTY');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await assertRows(rows, [ROWS.haamuTable1]);
  });

  test('Suodattaa sijoitteluntilalla VARALLA', async () => {
    await selectTila(page, 'VARALLA');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await assertRows(rows, [ROWS.kreiviTable1, ROWS.purukumiTable1]);
  });

  test('Suodattaa tiedolla kuuluuko hakijaryhmaan', async () => {
    await selectKuuluuRyhmaan(page, 'Kyllä');
    const rows = getYoAccordionContent(page).locator('tbody tr');
    await expect(rows).toHaveCount(3);
    await selectKuuluuRyhmaan(page, 'Ei');
    await assertRows(rows, [ROWS.haamuTable1]);
  });

  test('Suodattaa tiedolla onko hakemus hyvaksytty hakijaryhmasta', async () => {
    await selectHyvaksytty(page, 'Kyllä');
    const yoAccordionContent = getYoAccordionContent(page);
    const ammAccordionContent = getAmmAccordionContent(page);
    const yoRows = yoAccordionContent.locator('tbody tr');
    const ammRows = ammAccordionContent.locator('tbody tr');
    await expect(yoRows).toHaveCount(4);
    await expect(ammRows).toHaveCount(1);
    await selectHyvaksytty(page, 'Ei');
    await expect(yoRows).toHaveCount(0);
    await expect(ammRows).toHaveCount(3);
  });
});

async function selectTila(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Sijoittelun tila',
    option,
  });
}

async function selectKuuluuRyhmaan(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Kuuluu hakijaryhmään',
    option,
  });
}

async function selectHyvaksytty(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Hyväksytty hakijaryhmästä',
    option,
  });
}
