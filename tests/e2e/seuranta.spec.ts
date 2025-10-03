import { test, Page, expect, Locator } from '@playwright/test';
import { expectPageAccessibilityOk } from './playwright-utils';
import SEURANTA_YHTEENVETO from './fixtures/seuranta-yhteenveto.json';
import SEURANTA_HENKILOT from './fixtures/seuranta-henkilot.json';
import SEURANTA_VIRHE from './fixtures/seuranta-virhe.json';

async function initializeSeuranta(page: Page) {
  await page.route(
    '**/valintalaskenta-laskenta-service/resources/seuranta/yhteenvetokaikillelaskennoille',
    async (route) => route.fulfill({ json: SEURANTA_YHTEENVETO }),
  );
  await page.route(
    '**/oppijanumerorekisteri-service/henkilo/henkiloPerustietosByHenkiloOidList',
    async (route) => route.fulfill({ json: SEURANTA_HENKILOT }),
  );
  await page.route('**/yhteenveto', async (route) =>
    route.fulfill({ json: SEURANTA_VIRHE }),
  );
  await page.goto('/valintojen-toteuttaminen/seuranta');
  const spinners = page.getByRole('progressbar');
  await expect(spinners).toHaveCount(2);
}

test('Seuranta saavutettavuus', async ({ page }) => {
  await initializeSeuranta(page);
  await expectPageAccessibilityOk(page);
});

test('Näyttää seurantatiedot', async ({ page }) => {
  await initializeSeuranta(page);
  const rows = await page.locator('.seuranta-item').all();
  expect(rows.length).toEqual(4);
  await assertSeurantaItem(
    rows[0]!,
    'Keskeytynyt',
    'KD',
    'Turun ammattikorkeakoulu, Kupittaan kampus',
    true,
  );
  await assertSeurantaItem(
    rows[1]!,
    'Valmis',
    'HH',
    'Metropolia Ammattikorkeakoulu, Arabian kampus',
  );
  await assertSeurantaItem(
    rows[2]!,
    'Valmis',
    'RN',
    'Tampereen ammattikorkeakoulu, TAMK Pääkampus',
  );
  await assertSeurantaItem(
    rows[3]!,
    'Keskeytynyt',
    'RN',
    'Hämeen ammattikorkeakoulu, Riihimäki',
    true,
  );
});

test('Suodattaa seurantatiedot laskennan tilalla valmis', async ({ page }) => {
  await initializeSeuranta(page);
  await page.getByRole('combobox', { name: 'Laskennan tila Valitse' }).click();
  await page.getByRole('option', { name: 'Valmis' }).click();
  const rows = await page.locator('.seuranta-item').all();
  expect(rows.length).toEqual(2);
  await assertSeurantaItem(
    rows[0]!,
    'Valmis',
    'HH',
    'Metropolia Ammattikorkeakoulu, Arabian kampus',
  );
  await assertSeurantaItem(
    rows[1]!,
    'Valmis',
    'RN',
    'Tampereen ammattikorkeakoulu, TAMK Pääkampus',
  );
});

test('Suodattaa seurantatiedot laskennan tilalla keskeytynyt', async ({
  page,
}) => {
  await initializeSeuranta(page);
  await page.getByRole('combobox', { name: 'Laskennan tila Valitse' }).click();
  await page.getByRole('option', { name: 'Keskeytynyt' }).click();
  const rows = await page.locator('.seuranta-item').all();
  expect(rows.length).toEqual(2);
  await assertSeurantaItem(
    rows[0]!,
    'Keskeytynyt',
    'KD',
    'Turun ammattikorkeakoulu, Kupittaan kampus',
    true,
  );
  await assertSeurantaItem(
    rows[1]!,
    'Keskeytynyt',
    'RN',
    'Hämeen ammattikorkeakoulu, Riihimäki',
    true,
  );
});

async function assertSeurantaItem(
  locator: Locator,
  status: string,
  user: string,
  laskenta: string,
  hasError = false,
) {
  await expect(locator).toContainText(status);
  await expect(locator).toContainText(user);
  await expect(locator).toContainText(laskenta);
  if (hasError) {
    await expect(locator.getByRole('alert')).toBeVisible();
  } else {
    await expect(locator.getByRole('alert')).toBeHidden();
  }
}
