import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  selectOption,
} from './playwright-utils';

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
      '',
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
      '',
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
      '',
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
    ['', '3', 'Purukumi Puru', '0', '49', 'VARALLA(1)', 'Julkaistavissa'],
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
    ['', '', 'Hui Haamu', '0', '0', 'HYLÄTTY'],
    'td',
    false,
  );
});

test('does not show accept conditionally or payment column when toisen asteen yhteishaku', async ({
  page,
}) => {
  await page.route(
    '*/**/kouta-internal/haku/1.2.246.562.29.00000000000000045102*',
    async (route) => {
      const haku = {
        oid: '1.2.246.562.29.00000000000000045102',
        tila: 'julkaistu',
        hakutapaKoodiUri: 'hakutapa_01',
        hakuVuosi: '2024',
        hakukausi: 'kausi_s',
        totalHakukohteet: 1,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_11',
      };
      await route.fulfill({ json: haku });
    },
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/sijoittelun-tulokset',
  );
  await expectAllSpinnersHidden(page);
  const headrow = page.locator('thead tr').first();
  await checkRow(
    headrow,
    [
      '',
      'Jonosija',
      'Hakija',
      'Hakutoive',
      'Pisteet',
      'Sijoittelun tila',
      'Vastaanottotieto',
      'Ilmoittautumistieto',
      'Toiminnot',
    ],
    'th',
  );
  await expect(page.getByLabel('Ehdollinen valinta')).toBeHidden();
  await expect(page.getByLabel('Ehdollisuuden syy suomeksi')).toBeHidden();
});

test('shows other selection options for ehdollisuuden syy', async ({
  page,
}) => {
  const ammSection = page.getByLabel('Todistusvalinta (AMM)(');
  await ammSection.getByLabel('Ehdollinen valinta').click();
  await expect(ammSection.getByText('Valitse...')).toBeVisible();
  await ammSection.getByText('Valitse...').click();
  await expect(page.getByRole('option', { name: 'Muu' })).toBeVisible();
  await page.getByRole('option', { name: 'Muu' }).click();
  await expect(
    ammSection.getByLabel('Ehdollisuuden syy suomeksi'),
  ).toBeVisible();
  await expect(
    ammSection.getByLabel('Ehdollisuuden syy ruotsiksi'),
  ).toBeVisible();
  await expect(
    ammSection.getByLabel('Ehdollisuuden syy englanniksi'),
  ).toBeVisible();
});

test.describe('filters', () => {
  test('filters by name', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    let rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '1', 'Nukettaja Ruhtinas']);
    await hakuInput.fill('Dac');
    rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '2', 'Dacula Kreivi']);
  });

  test('filters by application oid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('filters henkiloOid', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });

  test('filters by julkaisutila VARALLA', async ({ page }) => {
    await selectTila(page, 'VARALLA');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });

  test('filters by julkaisutila HYLÄTTY', async ({ page }) => {
    await selectTila(page, 'HYLÄTTY');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('filters by showing only changed applications', async ({ page }) => {
    await page.getByLabel('Näytä vain edellisestä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('filters by showing only conditionally accepted applications', async ({
    page,
  }) => {
    await page.getByLabel('Näytä vain ehdollisesti hyvä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });
});

test.describe('select', () => {
  test('selects all applications', async ({ page }) => {
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(2);
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByLabel('Valitse kaikki')
      .click();
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(1);
    await expect(page.getByText('Hakijoita valittu: 3')).toBeVisible();
  });

  test('selects applications', async ({ page }) => {
    await page.getByLabel('Valitse hakijan Dacula Kreivi').click();
    await expect(page.getByText('Hakijoita valittu: 1')).toBeVisible();
    await page.getByLabel('Valitse hakijan Purukumi Puru').click();
    await expect(page.getByText('Hakijoita valittu: 2')).toBeVisible();
  });

  test('mass changes applications vastaanottotieto', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByLabel('Valitse kaikki')
      .click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByText('Muuta vastaanottotieto')
      .click();
    await page.getByRole('option', { name: 'Perunut' }).click();
    await expect(
      page.getByText('Muutettiin tila 2 hakemukselle'),
    ).toBeVisible();
    await expect(page.getByRole('row').getByText('Perunut')).toHaveCount(2);
  });

  test('mass changes applications ilmoittautumistieto', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByLabel('Valitse kaikki')
      .click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByText('Muuta ilmoittautumistieto')
      .click();
    await page.getByRole('option', { name: 'Ei ilmoittautunut' }).click();
    await expect(
      page.getByText('Muutettiin tila 2 hakemukselle'),
    ).toBeVisible();
    await expect(
      page.getByRole('row').getByText('Ei ilmoittautunut'),
    ).toHaveCount(2);
  });
});

test.describe('saving changes', () => {
  test('informs that there is nothing to save', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expectAllSpinnersHidden(page);
    await expect(page.getByText('Ei muutoksia mitä tallentaa')).toBeVisible();
  });

  test('saves changes', async ({ page }) => {
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Valintaesityksen muutokset tallennuttu'),
    ).toBeVisible();
  });

  test('saving changes fails', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/lukuvuosimaksu/1.2.246.562.20.00000000000000045105*',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Unknown error' });
      },
    );
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(page.getByText('Unknown error')).toBeVisible();
  });
});

test.describe('accepting valintaesitys', () => {
  test('accept', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('save changes and accept', async ({ page }) => {
    await page.getByText('Läsnä (koko lukuvuosi)').click();
    await page.getByRole('option', { name: 'Ei ilmoittautunut' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('operation fails during saving changes', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/lukuvuosimaksu/1.2.246.562.20.00000000000000045105*',
      async (route) => {
        await route.fulfill({
          status: 400,
          body: 'Kumma syy taustajärjestelmästä',
        });
      },
    );
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(
      page.getByText('Kumma syy taustajärjestelmästä'),
    ).toBeVisible();
  });

  test('accept operation fail', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/valintaesitys/valintatapajono-yo/hyvaksytty*',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Räjähti' });
      },
    );
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(page.getByText('Räjähti')).toBeVisible();
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
  await selectOption(page, 'Sijoittelun tila', expectedOption);
}
