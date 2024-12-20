import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  getMuiCloseButton,
  selectOption,
} from './playwright-utils';
import path from 'path';
import { readFile } from 'fs/promises';

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

async function selectTila(page: Page, expectedOption: string) {
  await selectOption(page, 'Tila', expectedOption);
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

test.beforeEach(async ({ page }) => await goToPisteSyotto(page));

test('displays pistesyotto with all exams', async ({ page }) => {
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
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 204,
      }),
  );
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
  await selectOption(page, 'Osallistumisen tila', 'Osallistui', huiRow);
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(page.getByText('Tiedot tallennettu.')).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(page.getByText('Tiedot tallennettu.')).toBeHidden();
});

test('shows error toast when updating value', async ({ page }) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      }),
  );
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
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
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
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
  test('filters by name', async ({ page }) => {
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

  test('filters by application oid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  });

  test('filters henkiloOid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('filters by osallistumisentila Merkitsemättä', async ({ page }) => {
    await selectTila(page, 'Merkitsemättä');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
    await checkRow(rows.nth(1), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('filters by osallistumisentila Osallistui', async ({ page }) => {
    await selectTila(page, 'Osallistui');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);

    await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
    await checkRow(rows.nth(1), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
  });
});

test.describe('Excel export', () => {
  test('Downloads excel on button press and no errors', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/pistesyotto/vienti',
        ),
      async (route) => {
        await route.fulfill({
          json: { id: 'proc_id' },
        });
      },
    );

    await page.route(
      (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/proc_id',
        ),
      async (route) => {
        await route.fulfill({
          json: { dokumenttiId: 'doc_id' },
        });
      },
    );
    await page.route(
      (url) =>
        url.pathname.includes(
          'valintalaskentakoostepalvelu/resources/dokumentit/lataa/doc_id',
        ),
      async (route) => {
        await route.fulfill({
          headers: { 'content-type': 'application/octet-stream' },
          body: await readFile(path.join(__dirname, './fixtures/empty.xls')),
        });
      },
    );
    const downloadPromise = page.waitForEvent('download');
    await page
      .getByRole('button', {
        name: 'Vie taulukkolaskentaan',
      })
      .click();

    await expectAllSpinnersHidden(page);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toEqual('pistesyotto.xls');
  });

  test('Shows error toast when download fails', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/pistesyotto/vienti',
        ),
      async (route) => await route.fulfill({ status: 500 }),
    );
    await page
      .getByRole('button', {
        name: 'Vie taulukkolaskentaan',
      })
      .click();
    await expectAllSpinnersHidden(page);
    await expect(
      page.getByText('Pistetietojen vieminen taulukkolaskentaan epäonnistui'),
    ).toBeVisible();
  });
});

const startExcelImport = async (page: Page) => {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page
    .getByRole('button', {
      name: 'Tuo taulukkolaskennasta',
    })
    .click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, './fixtures/empty.xls'));
};

test.describe('Excel import', () => {
  test('Shows error modal when upload fails completely', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          'valintalaskentakoostepalvelu/resources/pistesyotto/tuonti',
        ),
      async (route) => await route.fulfill({ status: 500 }),
    );
    await startExcelImport(page);

    await expect(
      page.getByText('Tuodaan pistetietoja taulukkolaskennasta'),
    ).toBeVisible();
    await expectAllSpinnersHidden(page);
    await expect(
      page.getByText('Pistetietojen tuominen taulukkolaskennasta epäonnistui!'),
    ).toBeVisible();
  });

  test('Shows error modal when upload fails partially', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          'valintalaskentakoostepalvelu/resources/pistesyotto/tuonti',
        ),
      async (route) =>
        await route.fulfill({
          json: [
            {
              applicationOID: '1234',
              errorMessage: 'Yritettiin kirjoittaa yli uudempaa pistetietoa',
            },
          ],
        }),
    );
    await startExcelImport(page);

    await expect(
      page.getByText('Tuodaan pistetietoja taulukkolaskennasta'),
    ).toBeVisible();
    await expectAllSpinnersHidden(page);

    const modalContent = page.getByRole('dialog', {
      name: 'Pistetietojen tuominen taulukkolaskennasta epäonnistui osittain!',
    });

    await expect(modalContent).toBeVisible();

    await expect(
      modalContent.getByText('Yritettiin kirjoittaa yli uudempaa pistetietoa'),
    ).toBeVisible();

    await modalContent.getByRole('button', { name: 'Sulje' }).first().click();
  });
});
