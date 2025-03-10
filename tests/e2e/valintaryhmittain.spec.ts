import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
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
    organisaatioOid: 'organisaatio-2',
    organisaatioNimi: { fi: 'Liukumäki' },
    jarjestyspaikkaHierarkiaNimi: { fi: 'Sibeliuksen puisto' },
    voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
    opetuskieliKoodiUrit: ['fi'],
    tarjoaja: 'tarjoaja-2',
  },
] as const;

test('Valintaryhmittäin saavutettavuus', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
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

  test('nimellä suodatus', async () => {
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

  test('klikkaamalla valintaryhmää', async () => {
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

  test('klikkaamalla valintaryhmää jolla ei suoria hakukohdeviitteitä', async () => {
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

  test('klikkaamalla koko haun valintaryhmää', async () => {
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

  test('suoralla linkillä', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma/2234567-3234567',
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

  test('käynnistää laskennan', async () => {
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000017683/tyyppi/VALINTARYHMA/whitelist/true?**',
      async (route) => {
        const started = {
          lisatiedot: {
            luotiinkoUusiLaskenta: true,
          },
          latausUrl: '12345vr',
        };
        await route.fulfill({ status: 200, json: started });
      },
    );
    await page.route(
      '*/**/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345vr',
      async (route) => {
        const seuranta = {
          tila: 'MENEILLAAN',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 0,
          hakukohteitaKeskeytetty: 0,
        };
        await route.fulfill({
          json: seuranta,
        });
      },
    );
    await startLaskenta(page);
    const spinners = page.getByRole('progressbar');
    await expect(spinners).toHaveCount(1);
  });

  test('näyttää laskennan valmistuneen', async () => {
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000017683/tyyppi/VALINTARYHMA/whitelist/true?**',
      async (route) => {
        const started = {
          lisatiedot: {
            luotiinkoUusiLaskenta: true,
          },
          latausUrl: '12345vr',
        };
        await route.fulfill({ status: 200, json: started });
      },
    );
    await page.route(
      '*/**/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345vr',
      async (route) => {
        const seuranta = {
          tila: 'VALMIS',
          hakukohteitaYhteensa: 2,
          hakukohteitaValmiina: 2,
          hakukohteitaKeskeytetty: 0,
        };
        await route.fulfill({
          json: seuranta,
        });
      },
    );
    await page.route(
      '*/**/resources/valintalaskentakerralla/status/12345vr/yhteenveto',
      async (route) => {
        await route.fulfill({
          json: {
            tila: 'VALMIS',
            hakukohteet: [
              {
                tila: 'VALMIS',
                hakukohde: 'hakukohde-1',
                ilmoitukset: [],
              },
              {
                tila: 'VALMIS',
                hakukohde: 'hakukohde-2',
                ilmoitukset: [],
              },
            ],
          },
        });
      },
    );
    await startLaskenta(page);
    await expect(
      page.getByText('Laskenta suoritettu onnistuneesti'),
    ).toBeVisible();
  });

  test('näyttää virheen epäonnistuneessa laskennassa', async () => {
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000017683/tyyppi/VALINTARYHMA/whitelist/true?**',
      async (route) => {
        const started = {
          lisatiedot: {
            luotiinkoUusiLaskenta: true,
          },
          latausUrl: '12345vr',
        };
        await route.fulfill({ status: 200, json: started });
      },
    );
    await page.route(
      '*/**/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345vr',
      async (route) => {
        const seuranta = {
          tila: 'VALMIS',
          hakukohteitaYhteensa: 2,
          hakukohteitaValmiina: 0,
          hakukohteitaKeskeytetty: 2,
        };
        await route.fulfill({
          json: seuranta,
        });
      },
    );
    await page.route(
      '*/**/resources/valintalaskentakerralla/status/12345vr/yhteenveto',
      async (route) => {
        await route.fulfill({
          json: {
            tila: 'VALMIS',
            hakukohteet: [
              {
                tila: 'VIRHE',
                hakukohdeOid: 'hakukohde-1',
                ilmoitukset: [{ otsikko: 'Rusahti' }],
              },
              {
                tila: 'VIRHE',
                hakukohdeOid: 'hakukohde-2',
                ilmoitukset: [{ otsikko: 'Räjähti' }],
              },
            ],
          },
        });
      },
    );
    await startLaskenta(page);
    await expect(
      page.getByText(
        'Laskenta on päättynyt. Hakukohteita valmiina 0/2. Suorittamattomia hakukohteita 2.',
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Näytä suorittamattomat' }).click();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Syy:Rusahti$/ })
        .getByRole('paragraph'),
    ).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Syy:Räjähti$/ })
        .getByRole('paragraph'),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Rusahti' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Räjähti' })).toBeVisible();
  });

  test('näyttää virheen kun laskennan aloitus epäonnistuu', async () => {
    await page.route(
      '**/valintalaskenta-laskenta-service/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000017683/tyyppi/VALINTARYHMA/whitelist/true?**',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Unknown error' });
      },
    );
    await startLaskenta(page);
    await expect(page.getByText('Valintalaskenta epäonnistui')).toBeVisible();
    await expect(page.getByText('Unknown error')).toBeVisible();
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
