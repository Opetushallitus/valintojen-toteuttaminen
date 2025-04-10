import test, { expect, Page } from '@playwright/test';
import {
  expectAlertTextVisible,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  mockValintalaskentaRun,
} from './playwright-utils';
import { NDASH } from '@/lib/constants';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2025-02-05T12:00:00'));
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/yhteisvalinnan-hallinta',
  );
});

const startLaskenta = async (page: Page, name: string) => {
  await page.getByRole('button', { name }).click();
  await page.getByRole('button', { name: 'Kyllä' }).click();
};

test('Yhteisvalinnan hallinta saavutettavuus', async ({ page }) => {
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Näyttää haun tiedot', async ({ page }) => {
  await expect(page.getByLabel('Haku')).toHaveText(
    'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  await expect(page.getByLabel('Haun tunniste')).toHaveText(
    '1.2.246.562.29.00000000000000045102',
  );
  await expect(
    page.getByRole('link', { name: 'Haun asetukset' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tarjonta' })).toBeVisible();
});

test.describe('Valintalaskenta', () => {
  test('Näytetään virhe, kun valintalaskennan käynnistäminen epäonnistuu', async ({
    page,
  }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKU',
      startResponse: { status: 500, body: 'Unknown error' },
    });

    await startLaskenta(page, 'Valintalaskenta haulle');

    await expectAlertTextVisible(
      page,
      'Valintalaskenta epäonnistuiUnknown error',
    );
    await expect(
      page.getByText('Näytä suorittamattomat hakukohteet'),
    ).toBeHidden();
  });

  test('Näytetään notifikaatio ja tiedot kun laskenta päättyy onnistuneesti', async ({
    page,
  }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKU',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 1,
          hakukohteitaKeskeytetty: 0,
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

    await startLaskenta(page, 'Valintalaskenta haulle');

    await expectAlertTextVisible(page, 'Laskenta suoritettu onnistuneesti');
    await expect(
      page.getByText(
        'Laskenta on päättynyt. Hakukohteita valmiina 1/1. Suorittamattomia hakukohteita 0.',
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sulje laskennan tiedot' }),
    ).toBeVisible();
  });

  test('käynnistetään laskenta ja näytetään yhteenveto virheistä', async ({
    page,
  }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKU',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 1,
          hakukohteitaKeskeytetty: 0,
        },
      },
      yhteenvetoResponse: {
        json: {
          tila: 'VALMIS',
          hakukohteet: [
            {
              hakukohdeOid: '1.2.246.562.20.00000000000000045105',
              tila: 'VIRHE',
              ilmoitukset: [
                {
                  tyyppi: 'VIRHE',
                  otsikko: 'Unknown Error',
                },
              ],
            },
          ],
        },
      },
    });

    await startLaskenta(page, 'Valintalaskenta haulle');
    await expect(
      page.getByText(
        'Laskenta on päättynyt. Hakukohteita valmiina 0/1. Suorittamattomia hakukohteita 1.',
      ),
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Näytä suorittamattomat hakukohteet' })
      .click();

    await expect(
      page.getByText(
        `Tampereen yliopisto, Rakennetun ympäristön tiedekunta ${NDASH} Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) (1.2.246.562.20.00000000000000045105)`,
      ),
    ).toBeVisible();
    await expect(page.getByText('Syy:Unknown Error')).toBeVisible();
  });

  test('Käynnistää erilaiset laskennat painikkeista', async ({ page }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKU',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'MENEILLAAN',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 0,
          hakukohteitaKeskeytetty: 0,
        },
      },
      yhteenvetoResponse: {
        json: {
          tila: 'PERUUTETTU',
          hakukohteet: [
            {
              tila: 'TEKEMATTA',
              hakukohdeOid: '1.2.246.562.20.00000000000000045105',
              ilmoitukset: [],
            },
          ],
        },
      },
    });

    await startLaskenta(page, 'Valintakoelaskenta haulle');

    const stopButton = page.getByRole('button', {
      name: 'Keskeytä valintalaskenta',
    });

    await expect(
      page.getByRole('heading', {
        name: 'Valintakoelaskenta haulle',
      }),
    ).toBeVisible();
    await stopButton.click();

    await startLaskenta(page, 'Valintalaskenta haulle');

    await expect(
      page.getByRole('heading', {
        name: 'Valintalaskenta haulle',
      }),
    ).toBeVisible();
    await stopButton.click();

    await startLaskenta(page, 'Valintakoelaskenta ja valinta haulle');

    await expect(
      page.getByRole('heading', {
        name: 'Valintakoelaskenta ja valinta haulle',
      }),
    ).toBeVisible();

    await stopButton.click();
    await expect(page.getByText('Laskenta on päättynyt')).toBeVisible();
    await page.getByRole('button', { name: 'Sulje laskennan tiedot' }).click();
    await expect(page.getByText('Laskenta on päättynyt')).toBeHidden();
  });
});

test.describe('Sijoittelu', () => {
  test('Otetaan ajastettu sijoittelu käyttöön', async ({ page }) => {
    await expect(
      page.getByText('Ajastettu sijoittelu ei ole käytössä'),
    ).toBeVisible();
    await page.getByPlaceholder('pp.kk.vvvv hh.mm').click();
    await page.getByLabel('Choose maanantaina 17.').click();
    await page.getByRole('option', { name: '16.30' }).click();
    await expect(page.getByPlaceholder('pp.kk.vvvv hh.mm')).toHaveValue(
      '17.02.2025 16:30',
    );
    await page
      .getByRole('button', { name: 'Ota ajastettu sijoittelu kä' })
      .click();
    await expect(
      page.getByText('Ajastettu sijoittelu on käytössä'),
    ).toBeVisible();
  });

  test('Poistetaan ajastettu sijoittelu käytöstä', async ({ page }) => {
    await page.route(
      '**/sijoittelu-service/resources/koostesijoittelu/jatkuva**',
      async (route) => {
        await route.fulfill({
          json: {
            ajossa: true,
            aloitusajankohta: 'Feb 20, 2025, 4:00:00 PM',
            ajotiheys: '12',
          },
        });
      },
    );
    await expect(
      page.getByText('Ajastettu sijoittelu on käytössä'),
    ).toBeVisible();
    await expect(page.getByPlaceholder('pp.kk.vvvv hh.mm')).toHaveValue(
      '20.02.2025 16:00',
    );
    await expect(
      page.getByRole('combobox', { name: 'Valitse ajotiheys' }),
    ).toContainText('12 tuntia');
    await page.getByRole('button', { name: 'Poista ajastus käytöstä' }).click();
    await expect(
      page.getByText('Ajastettu sijoittelu ei ole käytössä'),
    ).toBeVisible();
  });

  test('Käynnistetään sijoittelu', async ({ page }) => {
    await page.route(
      '**/sijoittelu-service/resources/koostesijoittelu/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102',
      async (route) => {
        await route.fulfill({
          json: {},
        });
      },
    );
    await page.route(
      '**/sijoittelu-service/resources/koostesijoittelu/status/1.2.246.562.29.00000000000000045102',
      async (route) => {
        await route.fulfill({
          json: {
            valmis: true,
            ohitettu: false,
            tekeillaan: false,
          },
        });
      },
    );
    await page.getByRole('button', { name: 'Suorita sijoittelu' }).click();
    await expect(page.getByText('Sijoittelu on valmis')).toBeVisible();
  });

  test('Sijoittelu päätyy virheeseen', async ({ page }) => {
    await page.route(
      '**/sijoittelu-service/resources/koostesijoittelu/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102',
      async (route) =>
        await route.fulfill({ status: 500, body: 'Unknown error' }),
    );
    await page.route(
      '**/sijoittelu-service/resources/koostesijoittelu/status/1.2.246.562.29.00000000000000045102',
      async (route) => {
        await route.fulfill({
          json: {
            valmis: false,
            ohitettu: true,
            tekeillaan: false,
          },
        });
      },
    );
    await page.getByRole('button', { name: 'Suorita sijoittelu' }).click();
    await expect(
      page.getByText('Sijoittelun suorittaminen epäonnistui'),
    ).toBeVisible();
  });
});
