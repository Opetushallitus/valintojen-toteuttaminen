import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  mockOneOrganizationHierarchy,
  mockValintalaskentaRun,
} from './playwright-utils';

const HAKUKOHTEET = [
  {
    oid: 'hakukohde-1',
    hakuOid: '1.2.246.562.29.00000000000000017683',
    nimi: { fi: 'Hiekkalinnan rakentajat' },
    organisaatioOid: 'organisaatio-1',
    organisaatioNimi: { fi: 'Hiekkalaatikko' },
    jarjestyspaikkaHierarkiaNimi: { fi: 'Hiekkasärkät' },
    voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
    opetuskieliKoodiUrit: ['fi'],
    tarjoaja: 'tarjoaja-1',
  },
  {
    oid: 'hakukohde-2',
    hakuOid: '1.2.246.562.29.00000000000000017683',
    nimi: { fi: 'Pihakeinun pystyttäjät' },
    organisaatioOid: 'organisaatio-2',
    organisaatioNimi: { fi: 'Pihakeinu' },
    jarjestyspaikkaHierarkiaNimi: { fi: 'Sibeliuksen puisto' },
    voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
    opetuskieliKoodiUrit: ['fi'],
    tarjoaja: 'tarjoaja-2',
  },
  {
    oid: 'hakukohde-tutu',
    hakuOid: '1.2.246.562.29.00000000000000017683',
    nimi: { fi: 'Liukumäen testaajat' },
    organisaatioOid: '1.2.246.562.10.28054987509',
    organisaatioNimi: { fi: 'Liukumäki' },
    jarjestyspaikkaHierarkiaNimi: { fi: 'Sibeliuksen puisto' },
    voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
    opetuskieliKoodiUrit: ['fi'],
    tarjoaja: '1.2.246.562.10.28054987509',
  },
] as const;

test('Valintaryhmittäin saavutettavuus', async ({ page }) => {
  await page.route(
    '**/valintalaskenta-laskenta-service/resources/haku/1.2.246.562.29.00000000000000017683/lasketut-hakukohteet',
    async (route) => {
      await route.fulfill({ json: [] });
    },
  );
  await page.route(
    '*/**/kouta-internal/hakukohde/search?all=false&haku=1.2.246.562.29.00000000000000017683*',
    async (route) => {
      await route.fulfill({ json: HAKUKOHTEET });
    },
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('Valintaryhmillä hakeminen', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
  });

  test('Näyttää valintaryhmät listassa', async () => {
    await expect(page.getByText('Valitse valintaryhmä')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeVisible();
  });

  test('Piilottaa ja näyttää haitarin sisällön', async () => {
    await page.getByLabel('Piilota alavalintaryhmät').click();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await page.getByLabel('Näytä alavalintaryhmät').click();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeVisible();
  });

  test('Nimellä suodatus', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae valintaryhmiä',
    });
    await hakuInput.fill('TUT');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeHidden();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeVisible();
    await hakuInput.fill('Peruskaav');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeHidden();
  });

  test('Näyttää aina vähintään haun valintaryhmän', async () => {
    await page
      .getByRole('textbox', {
        name: 'Hae valintaryhmiä',
      })
      .fill('Purkkaa ja jesaria');
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeVisible();
  });
});

test.describe('Valintaryhmään navigoiminen', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/haku/1.2.246.562.29.00000000000000017683/lasketut-hakukohteet',
      async (route) => {
        await route.fulfill({ json: [] });
      },
    );
    await page.route(
      '*/**/kouta-internal/hakukohde/search?all=false&haku=1.2.246.562.29.00000000000000017683*',
      async (route) => {
        await route.fulfill({ json: HAKUKOHTEET });
      },
    );
  });

  test('Klikkaamalla valintaryhmää', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
    await page.getByRole('link', { name: 'Pääsykoe' }).click();
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('cell', { name: 'Hiekkasärkät, Hiekkalinnan' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Pihakeinun pystyttäjät',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Liukumäen testaajat',
      }),
    ).toBeHidden();
  });

  test('Klikkaamalla valintaryhmää jolla ei suoria hakukohdeviitteitä', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
    await page.getByRole('link', { name: 'Peruskoulupohjaiset' }).click();
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('cell', { name: 'Hiekkasärkät, Hiekkalinnan' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Pihakeinun pystyttäjät',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Liukumäen testaajat',
      }),
    ).toBeHidden();
  });

  test('Klikkaamalla koko haun valintaryhmää', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
    await page.getByRole('link', { name: 'Koko haun valintaryhmä' }).click();
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('cell', { name: 'Hiekkasärkät, Hiekkalinnan' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Pihakeinun pystyttäjät',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Liukumäen testaajat',
      }),
    ).toBeVisible();
  });

  test('Suoralla linkillä', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
    );
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('cell', { name: 'Hiekkasärkät, Hiekkalinnan' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Pihakeinun pystyttäjät',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Liukumäen testaajat',
      }),
    ).toBeHidden();
  });

  test('Näyttää lasketut hakukohteet', async () => {
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/haku/1.2.246.562.29.00000000000000017683/lasketut-hakukohteet',
      async (route) => {
        await route.fulfill({
          json: [
            {
              hakukohdeOid: 'hakukohde-1',
              lastModified: '2024-01-02 12:00:00',
            },
          ],
        });
      },
    );
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
    );
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(page.getByRole('cell', { name: '2.1.2024' })).toBeVisible();
  });
});

test.describe('Valintaryhmän laskenta', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/haku/1.2.246.562.29.00000000000000017683/lasketut-hakukohteet',
      async (route) => {
        await route.fulfill({ json: [] });
      },
    );
    await page.route(
      '*/**/kouta-internal/hakukohde/search?all=false&haku=1.2.246.562.29.00000000000000017683*',
      async (route) => {
        await route.fulfill({ json: HAKUKOHTEET });
      },
    );
  });

  test('Käynnistää laskennan', async () => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000017683',
      tyyppi: 'VALINTARYHMA',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'MENEILLAAN',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 0,
          hakukohteitaKeskeytetty: 0,
          tyyppi: 'VALINTARYHMA',
        },
      },
    });
    await startLaskenta(page);
    await expect(page.getByRole('progressbar')).toHaveCount(1);
    await expect(
      page.getByText('Tehtävä on laskennassa parhaillaan'),
    ).toBeVisible();
  });

  test('Näyttää laskennan valmistuneen', async () => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000017683',
      tyyppi: 'VALINTARYHMA',
      latausUrl: '12345vr',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 2,
          hakukohteitaValmiina: 2,
          hakukohteitaKeskeytetty: 0,
          tyyppi: 'VALINTARYHMA',
        },
      },
      yhteenvetoResponse: {
        json: {
          tila: 'VALMIS',
          hakukohteet: [
            {
              tila: 'VALMIS',
              hakukohdeOid: 'hakukohde-1',
              ilmoitukset: [],
            },
            {
              tila: 'VALMIS',
              hakukohdeOid: 'hakukohde-2',
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
  });

  test('Näyttää virheen epäonnistuneessa laskennassa', async () => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000017683',
      tyyppi: 'VALINTARYHMA',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 2,
          hakukohteitaValmiina: 0,
          hakukohteitaKeskeytetty: 2,
          tyyppi: 'VALINTARYHMA',
        },
      },
      yhteenvetoResponse: {
        json: {
          tila: 'VALMIS',
          hakukohteet: [
            {
              tila: 'VIRHE',
              hakukohdeOid: 'hakukohde-1',
              ilmoitukset: [{ tyyppi: 'VIRHE', otsikko: 'Rusahti' }],
            },
            {
              tila: 'VIRHE',
              hakukohdeOid: 'hakukohde-2',
              ilmoitukset: [{ tyyppi: 'VIRHE', otsikko: 'Räjähti' }],
            },
          ],
        },
      },
    });

    await startLaskenta(page);
    await expect(
      page.getByText(
        'Laskenta on päättynyt. Hakukohteita valmiina 0/2. Suorittamattomia hakukohteita 2.',
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Näytä suorittamattomat' }).click();
    await expect(page.getByText(/^Syy:Rusahti$/)).toBeVisible();
    await expect(page.getByText(/^Syy:Räjähti$/)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Rusahti' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Räjähti' })).toBeVisible();
  });

  test('Näyttää virheen kun laskennan aloitus epäonnistuu', async () => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000017683',
      tyyppi: 'VALINTARYHMA',
      startResponse: { status: 500, body: 'Unknown error' },
    });

    await startLaskenta(page);
    await expect(page.getByText('Valintalaskenta epäonnistui')).toBeVisible();
    await expect(page.getByText('Unknown error')).toBeVisible();
  });
});

test.describe('Käyttäjällä oikeus vain yhteen valintaryhmään', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await mockOneOrganizationHierarchy(page, {
      oid: '1.2.246.562.10.28054987509',
    });
    await page.route(
      '*/**/kayttooikeus-service/henkilo/current/omattiedot',
      async (route) => {
        const user = {
          organisaatiot: [
            {
              organisaatioOid: '1.2.246.562.10.28054987509',
              kayttooikeudet: [
                { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'CRUD' },
              ],
            },
          ],
        };
        await route.fulfill({ json: user });
      },
    );
    await page.route(
      '*/**/kouta-internal/hakukohde/search?all=false&haku=1.2.246.562.29.00000000000000017683*',
      async (route) => {
        await route.fulfill({ json: HAKUKOHTEET });
      },
    );
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/haku/1.2.246.562.29.00000000000000017683/lasketut-hakukohteet',
      async (route) => {
        await route.fulfill({ json: [] });
      },
    );
  });

  test('Näyttää valintaryhmät listassa', async () => {
    await expect(page.getByText('Valitse valintaryhmä')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Koko haun valintaryhmä' }),
    ).toBeHidden();
    await expect(page.getByText('Koko haun valintaryhmä')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Peruskoulupohjaiset' }),
    ).toBeHidden();
    await expect(page.getByRole('link', { name: 'Peruskaava' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Pääsykoe' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'TUTU' })).toBeVisible();
  });

  test('Navigoi sallittuun valintaryhmään', async () => {
    await expect(page.getByText('Valitse valintaryhmä')).toBeVisible();
    await page.getByRole('link', { name: 'TUTU' }).click();
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Hiekkasärkät, Hiekkalinnan' }),
    ).toBeHidden();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Pihakeinun pystyttäjät',
      }),
    ).toBeHidden();
    await expect(
      page.getByRole('cell', {
        name: 'Sibeliuksen puisto, Liukumäen testaajat',
      }),
    ).toBeVisible();
  });

  test('Laskentanappi on piilotettu jos käyttäjällä ei ole oikeuksia valintaryhmään', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
    );
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeHidden();
  });
});

async function startLaskenta(page: Page) {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
  );
  await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
  await page.getByRole('button', { name: 'Suorita valintalaskenta' }).click();
  await page.getByRole('button', { name: 'Kyllä' }).click();
}
