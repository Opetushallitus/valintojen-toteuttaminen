import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  fixtureFromFile,
  selectOption,
} from './playwright-utils';
import { configuration } from '@/app/lib/configuration';

async function goToHarkinnanvaraiset(page: Page) {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094/harkinnanvaraiset',
  );
}

test.beforeEach(async ({ page }) => {
  await page.route(
    configuration.hakemuksetUrl +
      '?hakuOid=1.2.246.562.29.00000000000000021303&hakukohdeOid=1.2.246.562.20.00000000000000024094',
    fixtureFromFile('toisen-asteen-yhteishaku/hakeneet.json'),
  );

  await page.route(
    configuration.harkinnanvaraisuudetHakemuksilleUrl,
    fixtureFromFile(
      'toisen-asteen-yhteishaku/harkinnanvaraisuudet-hakemuksille.json',
    ),
  );

  await page.route(
    configuration.getHarkinnanvaraisetTilatUrl({
      hakuOid: '1.2.246.562.29.00000000000000021303',
      hakukohdeOid: '1.2.246.562.20.00000000000000024094',
    }),
    (route) => {
      if (route.request().method() === 'GET') {
        return fixtureFromFile(
          'toisen-asteen-yhteishaku/harkinnanvaraiset-tilat.json',
        )(route);
      }
    },
  );

  await goToHarkinnanvaraiset(page);
});

test('harkinnanvaraiset accessibility', async ({ page }) => {
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('displays harkinnanvaraiset', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeEnabled();

  await expect(
    page.getByRole('button', { name: 'Aseta valitut hyväksytyiksi' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Muodosta osoitetarrat' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Poista valinta' }),
  ).toBeDisabled();

  const headRow = page.locator('thead tr');
  await checkRow(headRow, [
    '',
    'Hakija',
    'Harkinnanvaraisuuden syy',
    'Harkinnanvarainen tila',
  ]);
  const contentRows = page.locator('tbody tr');
  await expect(contentRows).toHaveCount(4);

  await checkRow(contentRows.nth(0), [
    '',
    'Nukettaja Ruhtinas',
    'Ei päättötodistusta (ATARU)',
    'Hyväksytty',
  ]);
  await checkRow(contentRows.nth(1), [
    '',
    'Dacula Kreivi',
    'Sosiaaliset syyt',
    '\u2013',
  ]);
  await checkRow(contentRows.nth(2), [
    '',
    'Purukumi Puru',
    'Oppimisvaikeudet',
    '\u2013',
  ]);
  await checkRow(contentRows.nth(3), [
    '',
    'Hui Haamu',
    'Riittämätön tutkintokielen taito',
    '\u2013',
  ]);
});

test('"Valitse kaikki", "Poista valinta" and "Aseta valitut hyväksytyiksi" controls work', async ({
  page,
}) => {
  await expect(page.getByText('Ei hakijoita valittu')).toBeVisible();

  const valitseKaikkiCheckbox = page.getByRole('checkbox', {
    name: 'Valitse kaikki',
  });
  const asetaValitutButton = page.getByRole('button', {
    name: 'Aseta valitut hyväksytyiksi',
  });
  const poistaValintaButton = page.getByRole('button', {
    name: 'Poista valinta',
  });

  await valitseKaikkiCheckbox.click();

  await expect(page.getByText('Hakijoita valittu: 4')).toBeVisible();
  await asetaValitutButton.click();

  await expect(
    page
      .getByRole('combobox', { name: 'Harkinnanvarainen tila' })
      .and(page.getByText('Hyväksytty')),
  ).toHaveCount(4);

  await poistaValintaButton.click();

  await expect(page.getByText('Ei hakijoita valittu')).toBeVisible();
  for (const checkbox of await page.getByRole('checkbox').all()) {
    await expect(checkbox).not.toBeChecked();
  }
});

const HARKINNANVARAINEN_INPUT_NAME =
  'Harkinnanvarainen tila hakijan "Hui Haamu" hakemukselle';

test('shows success toast when successfully updating harkinnanvarainen tila', async ({
  page,
}) => {
  await page.route(
    configuration.setHarkinnanvaraisetTilatUrl,
    async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 500 });
      }
    },
  );
  await selectOption(page, HARKINNANVARAINEN_INPUT_NAME, 'Hyväksytty');
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const errorDialog = page.getByRole('alert').filter({
    hasText: 'Harkinnanvaraisten tilojen tallentamisessa tapahtui virhe!',
  });

  await expect(errorDialog).toBeVisible();
});

test('shows error toast when failed updating harkinnanvarainen tila', async ({
  page,
}) => {
  await page.route(
    configuration.setHarkinnanvaraisetTilatUrl,
    async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 200 });
      }
    },
  );

  await selectOption(page, HARKINNANVARAINEN_INPUT_NAME, 'Hyväksytty');
  await page.getByRole('button', { name: 'Tallenna' }).click();

  const successDialog = page.getByRole('alert').filter({
    hasText: 'Harkinnanvaraisten tilojen tallentaminen onnistui',
  });
  await expect(successDialog).toBeVisible();
});

test('asks for confirmation before navigating to another view without saving changes', async ({
  page,
}) => {
  await selectOption(page, HARKINNANVARAINEN_INPUT_NAME, 'Hyväksytty');
  const confirmationDialog = page.getByRole('alert').filter({
    hasText:
      'Olet poistumassa lomakkeelta jolla on tallentamattomia muutoksia. Jatketaanko silti?',
  });
  const perustiedotLink = page
    .getByRole('navigation')
    .getByRole('link', { name: 'Perustiedot' });

  await perustiedotLink.click();
  await expect(confirmationDialog).toBeVisible();
  await confirmationDialog.getByRole('button', { name: 'Peruuta' }).click();
  await expect(confirmationDialog).toBeHidden();
  await expect(page).toHaveURL(/.*harkinnanvaraiset/);
  await perustiedotLink.click();
  await expect(confirmationDialog).toBeVisible();
  await confirmationDialog.getByRole('button', { name: 'Jatka' }).click();
  await expect(confirmationDialog).toBeHidden();
  await expect(page).toHaveURL(/.*perustiedot/);
});