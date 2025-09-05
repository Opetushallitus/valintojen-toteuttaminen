import { test, expect, Page, Locator } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectTextboxValue,
  fixtureFromFile,
  mockOneOrganizationHierarchy,
} from './playwright-utils';
import { NDASH } from '@/lib/constants';
import LASKETUT_VALINNANVAIHEET from './fixtures/lasketut-valinnanvaiheet.json';
import VALINNANVAIHE_TULOKSET_ILMAN_LASKENTAA from './fixtures/valinnanvaihe-tulokset-ilman-laskentaa.json';
import VALINNANVAIHEET_ILMAN_LASKENTAA from './fixtures/valinnanvaiheet-ilman-laskentaa.json';

const getTableRows = (loc: Page | Locator) => loc.locator('tbody tr');

test('Näyttää vain organisaatiot joille käyttäjällä on oikeus', async ({
  page,
}) => {
  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      const user = {
        organisaatiot: [
          {
            organisaatioOid: '1.2.246.562.10.79559059674',
            kayttooikeudet: [
              { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'READ' },
            ],
          },
        ],
      };
      await route.fulfill({ json: user });
    },
  );
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
  const tableRows = getTableRows(page);
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows).toContainText(
    'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
});

test('Näyttää virheviestin kun käyttäjällä ei ole oikeuksia', async ({
  page,
}) => {
  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      await route.fulfill({
        json: {
          organisaatiot: [
            {
              organisaatioOid: '1.2.246.562.10.79559059674',
              kayttooikeudet: [{ palvelu: 'PALVELU', oikeus: 'READ' }],
            },
          ],
        },
      });
    },
  );
  await page.goto('/');
  await expect(page.getByText('Ei riittäviä käyttöoikeuksia.')).toBeVisible();
});

test.describe('Toiminnot on piilotettu tai poistettu käytöstä jos käyttäjällä on vain lukuoikeus', () => {
  test.beforeEach(async ({ page }) => {
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
                { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'READ' },
              ],
            },
          ],
        };
        await route.fulfill({ json: user });
      },
    );
    await page.route(
      '**/lomake-editori/api/external/valinta-ui?hakuOid=1.2.246.562.29.00000000000000021303&hakukohdeOid=1.2.246.562.20.00000000000000024094',
      fixtureFromFile('toisen-asteen-yhteishaku/hakeneet.json'),
    );
  });

  test('Harkinnanvaraiset välilehdellä', async ({ page }) => {
    await page.route(
      '**/valintalaskentakoostepalvelu/resources/harkinnanvaraisuus/hakemuksille',
      fixtureFromFile(
        'toisen-asteen-yhteishaku/harkinnanvaraisuudet-hakemuksille.json',
      ),
    );

    await page.route(
      '**/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094',
      (route) => {
        if (route.request().method() === 'GET') {
          return fixtureFromFile(
            'toisen-asteen-yhteishaku/harkinnanvaraiset-tilat.json',
          )(route);
        }
      },
    );
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094/harkinnanvaraiset',
    );
    await expectAllSpinnersHidden(page);
    await expect(page.getByRole('button', { name: 'Tallenna' })).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Aseta valitut hyväksytyiksi' }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Muodosta osoitetarrat' }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Poista valinta' }),
    ).toBeHidden();

    const contentRows = page.locator('tbody tr');
    await expect(contentRows).toHaveCount(4);

    await checkRow(contentRows.nth(0), [
      'Nukettaja Ruhtinas',
      'Ei päättötodistusta (ATARU)',
      'Hyväksytty',
    ]);
    await checkRow(contentRows.nth(1), [
      'Dacula Kreivi',
      'Sosiaaliset syyt',
      NDASH,
    ]);
    await checkRow(contentRows.nth(2), [
      'Purukumi Puru',
      'Oppimisvaikeudet',
      NDASH,
    ]);
    await checkRow(contentRows.nth(3), [
      'Hui Haamu',
      'Riittämätön tutkintokielen taito',
      NDASH,
    ]);
  });

  test('Sijoittelun tulokset välilehdellä', async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094/sijoittelun-tulokset',
    );

    const headrow = page.locator('thead tr').first();
    await checkRow(
      headrow,
      [
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

    const yoContent = page.getByRole('region', {
      name: 'Todistusvalinta (YO)',
    });

    await expect(yoContent.getByText('Muuta vastaanottotieto')).toBeHidden();
    await expect(yoContent.getByText('Muuta ilmoittautumistieto')).toBeHidden();
    await expect(
      yoContent.getByRole('button', { name: 'Tallenna', exact: true }),
    ).toBeHidden();

    // Hakemus listauksen piilotetut ja disabloinut toiminnot
    await expect(yoContent.getByText('Kesken', { exact: true })).toBeDisabled();
    await expect(
      page
        .getByRole('row', { name: '1 Nukettaja Ruhtinas 0 100' })
        .locator('label'),
    ).toBeDisabled();
    await expect(
      page.getByRole('combobox', { name: 'Ilmoittautumistieto' }),
    ).toBeDisabled();
    await page
      .getByRole('row', { name: 'Nukettaja Ruhtinas' })
      .getByRole('button', { name: 'Muut toiminnot' })
      .click();
    // Vain muutoshistoria näkyy hakemuksen toiminnot listassa
    expect(
      (
        await page
          .getByRole('menu', { name: 'Muut toiminnot' })
          .getByRole('menuitem')
          .all()
      ).length,
    ).toBe(1);
    await expect(page.getByText('Muutoshistoria')).toBeVisible();
    await page.locator('.MuiPopover-root > .MuiBackdrop-root').click();

    // Vain lataus toiminnot näkyvät hakukohteelle

    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    expect(
      (
        await page
          .getByRole('menu', { name: 'Muut toiminnot hakukohteelle' })
          .getByRole('menuitem')
          .all()
      ).length,
    ).toBe(3);
    await expect(
      page.getByRole('menuitem', { name: 'Lataa hyväksymiskirjeet' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Lataa osoitetarrat' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Lataa tulokset' }),
    ).toBeVisible();
  });

  test('Valintalaskennan tulokset välilehdellä - valintalaskennalla', async ({
    page,
  }) => {
    await page.route(
      /valintalaskenta-laskenta-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
      async (route) => await route.fulfill({ json: LASKETUT_VALINNANVAIHEET }),
    );
    await page.route(
      /valintaperusteet-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
      async (route) => await route.fulfill({ json: [] }),
    );
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094/valintalaskennan-tulokset',
    );

    const jono1HeadingText = 'Varsinainen valinta: Lukiokoulutus';

    await expect(
      page.getByRole('heading', {
        level: 4,
        name: jono1HeadingText,
      }),
    ).toBeVisible();

    const jono1Content = page.getByRole('region', { name: jono1HeadingText });

    const jono1Rows = jono1Content.locator('tbody tr');
    await expect(jono1Rows).toHaveCount(2);
    await checkRow(jono1Rows.nth(0), [
      '1',
      'Dacula Kreivi',
      '10 Lisätietoja',
      '2',
      'Hyväksyttävissä',
      'muutoksen syy',
    ]);

    await checkRow(jono1Rows.nth(1), [
      '2',
      'Purukumi Puru',
      '9,91 Lisätietoja',
      '1',
      'Hyväksyttävissä',
      '',
    ]);

    await expect(
      jono1Content.getByRole('button', { name: 'Poista jono sijoittelusta' }),
    ).toBeHidden();

    await expect(
      jono1Content
        .getByRole('row', { name: 'Dacula Kreivi' })
        .getByRole('button', { name: 'Muokkaa' }),
    ).toBeHidden();
  });

  test('Valintalaskennan tulokset välilehdellä - ilman valintalaskentaa', async ({
    page,
  }) => {
    await page.route(
      /valintalaskenta-laskenta-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
      async (route) =>
        await route.fulfill({ json: VALINNANVAIHE_TULOKSET_ILMAN_LASKENTAA }),
    );
    await page.route(
      /valintaperusteet-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
      async (route) =>
        await route.fulfill({ json: VALINNANVAIHEET_ILMAN_LASKENTAA }),
    );

    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000021303/hakukohde/1.2.246.562.20.00000000000000024094/valintalaskennan-tulokset',
    );

    const jonoHeadingText =
      'Varsinainen valinta: Tutkintoon valmentava koulutus';

    await expect(
      page.getByRole('heading', {
        level: 4,
        name: jonoHeadingText,
      }),
    ).toBeVisible();

    const jonoContent = page.getByRole('region', { name: jonoHeadingText });

    const jonoRows = jonoContent.locator('tbody tr');

    await expect(jonoRows).toHaveCount(4);

    await checkRow(jonoRows.first(), [
      expectTextboxValue('1'),
      'Nukettaja Ruhtinas',
      'Hyväksyttävissä',
      expectTextboxValue('Test fi'),
      expectTextboxValue('Test sv'),
      expectTextboxValue('Test en'),
    ]);

    await expect(
      page.getByRole('button', {
        name: 'Tuo taulukkolaskennasta',
      }),
    ).toBeHidden();

    await expect(
      jonoContent.getByRole('button', { name: 'Tallenna' }),
    ).toBeHidden();

    // Syöttökentät on disabloitu
    await expect(
      page.getByRole('cell', { name: '1' }).getByLabel('Jonosija'),
    ).toBeDisabled();
    await expect(page.getByText('Hyväksyttävissä')).toBeDisabled();
    await expect(
      page.getByRole('cell', { name: 'Test fi' }).getByLabel('Kuvaus suomeksi'),
    ).toBeDisabled();
    await expect(
      page
        .getByRole('cell', { name: 'Test sv' })
        .getByLabel('Kuvaus ruotsiksi'),
    ).toBeDisabled();
    await expect(
      page
        .getByRole('cell', { name: 'Test en' })
        .getByLabel('Kuvaus englanniksi'),
    ).toBeDisabled();
  });
});
