import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

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
      '*/**/kouta-internal/hakukohde/search?all=false&haku=1.2.246.562.29.00000000000000017683*',
      async (route) => {
        const hakukohteet = [
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
            oid: 'hakukohde-3',
            hakuOid: '1.2.246.562.29.00000000000000017683',
            nimi: { fi: 'Liukumäen testaajat' },
            organisaatioOid: 'organisaatio-2',
            organisaatioNimi: { fi: 'Liukumäki' },
            jarjestyspaikkaHierarkiaNimi: { fi: 'Sibeliuksen puisto' },
            voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
            opetuskieliKoodiUrit: ['fi'],
            tarjoaja: 'tarjoaja-2',
          },
        ];
        await route.fulfill({ json: hakukohteet });
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

  test('klikkaamalla valintaryhmää jolla ei hakukohdeviitteitä', async () => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000017683/valintaryhma',
    );
    await page.getByRole('link', { name: 'Peruskoulupohjaiset' }).click();
    await expect(page.getByText('Valitse valintaryhmä')).toBeHidden();
    await expect(
      page.getByText('Valintaryhmässä ei ole hakukohteita'),
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
