import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  mockDocumentProcess,
  selectOption,
  testMuodostaHakemusHyvaksymiskirje,
  testNaytaMuutoshistoria,
  waitForMethodRequest,
} from './playwright-utils';
import { buildConfiguration } from '@/lib/configuration/server-configuration';
import HAUT from './fixtures/haut.json';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { getConfigUrl } from '@/lib/configuration/configuration-utils';

const hakukohdeOid = '1.2.246.562.20.00000000000000045105';
const valintatapajonoOid = '1224656220000000000000000123456';

async function goToValinnanTulokset(page: Page) {
  await page.clock.setFixedTime(new Date('2025-02-05T12:00:00'));
  const configuration = await buildConfiguration();
  await page.route(
    getConfigUrl(
      configuration.routes.valintaTulosService.hakukohteenValinnanTulosUrl,
      {
        hakuOid: '1.2.246.562.29.00000000000000045102',
        hakukohdeOid,
      },
    ),
    async (route) => {
      await route.fulfill({
        json: [
          {
            hakukohdeOid,
            valintatapajonoOid,
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            henkiloOid: '1.2.246.562.24.69259807406',
            valinnantila: 'HYLATTY',
            valinnantilanKuvauksenTekstiFI: 'syy fi',
            valinnantilanKuvauksenTekstiSV: 'syy sv',
            valinnantilanKuvauksenTekstiEN: 'syy en',
            julkaistavissa: true,
            hyvaksyttyVarasijalta: false,
            hyvaksyPeruuntunut: false,
            vastaanottotila: 'KESKEN',
            ilmoittautumistila: 'EI_TEHTY',
            valinnantilanViimeisinMuutos: '2025-04-08T09:36:52.346+03:00',
          },
          {
            hakukohdeOid,
            valintatapajonoOid,
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            henkiloOid: '1.2.246.562.24.25732574711',
            valinnantila: 'HYVAKSYTTY',
            ehdollisestiHyvaksyttavissa: true,
            ehdollisenHyvaksymisenEhtoKoodi: 'muu',
            ehdollisenHyvaksymisenEhtoFI: 'test fi',
            ehdollisenHyvaksymisenEhtoSV: 'test sv',
            ehdollisenHyvaksymisenEhtoEN: 'test en',
            julkaistavissa: true,
            hyvaksyttyVarasijalta: false,
            hyvaksyPeruuntunut: false,
            vastaanottotila: 'VASTAANOTTANUT_SITOVASTI',
            ilmoittautumistila: 'LASNA_KOKO_LUKUVUOSI',
            valinnantilanViimeisinMuutos: '2025-04-08T09:36:52.346+03:00',
          },
          {
            hakukohdeOid,
            valintatapajonoOid,
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            henkiloOid: '1.2.246.562.24.14598775927',
            valinnantila: 'HYVAKSYTTY',
            ehdollisestiHyvaksyttavissa: false,
            julkaistavissa: true,
            hyvaksyttyVarasijalta: false,
            hyvaksyPeruuntunut: false,
            vastaanottotila: 'KESKEN',
            ilmoittautumistila: 'EI_TEHTY',
            valinnantilanViimeisinMuutos: '2025-04-08T09:36:52.346+03:00',
          },
        ],
      });
    },
  );

  await page.route(
    '*/**/ohjausparametrit-service/api/v1/rest/parametri/1.2.246.562.29.00000000000000045102',
    async (route) =>
      route.fulfill({
        json: {
          sijoittelu: false,
        },
      }),
  );

  await page.route(
    '*/**/kouta-internal/haku/1.2.246.562.29.00000000000000045102',
    async (route) => {
      const haku = {
        ...(HAUT.find((h) => h.oid === '1.2.246.562.29.00000000000000045102') ??
          {}),
        hakutapa: 'hakutapa_02',
      };
      await route.fulfill({ json: haku });
    },
  );

  await page.route(
    (url) => url.href.includes('valinnanvaihe?withValisijoitteluTieto=true'),
    async (route) => {
      return route.fulfill({
        json: [],
      });
    },
  );

  await page.route(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .myohastyneetHakemuksetUrl,
      {
        hakuOid: '1.2.246.562.29.00000000000000045102',
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
      },
    ),
    async (route) => {
      await route.fulfill({
        json: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            mennyt: true,
            vastaanottoDeadline: '2022-03-18T13:00:00.000Z',
          },
        ],
      });
    },
  );

  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valinnan-tulokset',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
}

async function selectValinnanTila(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Valinnan tila',
    option,
  });
}

test.beforeEach(({ page }) => goToValinnanTulokset(page));

test.describe('Valinnan tulokset', () => {
  test('Saavutettavuus', async ({ page }) => {
    await expectAllSpinnersHidden(page);
    await expectPageAccessibilityOk(page);
  });

  test('Näyttää valinnan tulokset', async ({ page }) => {
    const headRow = page.locator('thead tr');
    await checkRow(
      headRow,
      [
        '',
        'Hakija',
        'Valinnan tila',
        'Vastaanoton tila',
        'Ilmoittautumisen tila',
        'Toiminnot',
      ],
      'th',
    );
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(5);

    const nukettajaRow = rows.nth(0);
    await checkRow(
      nukettajaRow,
      [
        '',
        'Nukettaja Ruhtinas',
        'HYLÄTTYHakijalle näkyvä syy:',
        'JulkaistavissaKesken',
        '',
        '',
      ],
      'td',
      false,
    );

    const nukettajaValinnanTilaCell = nukettajaRow.getByRole('cell').nth(2);

    await expect(
      nukettajaValinnanTilaCell.getByLabel('Hylkäyksen syy suomeksi'),
    ).toHaveValue('syy fi');
    await expect(
      nukettajaValinnanTilaCell.getByLabel('Hylkäyksen syy ruotsiksi'),
    ).toHaveValue('syy sv');
    await expect(
      nukettajaValinnanTilaCell.getByLabel('Hylkäyksen syy englanniksi'),
    ).toHaveValue('syy en');

    const daculaRow = rows.nth(1);

    await checkRow(
      daculaRow,
      [
        '',
        'Dacula Kreivi',
        'HYVÄKSYTTYEhdollinen valintaMuu',
        'JulkaistavissaVastaanottanut sitovasti',
        'Läsnä (koko lukuvuosi)',
        '',
      ],
      'td',
      false,
    );
    const daculaValinnanTilaCell = daculaRow.getByRole('cell').nth(2);

    await expect(
      daculaValinnanTilaCell.getByLabel('Ehdollisuuden syy suomeksi'),
    ).toHaveValue('test fi');
    await expect(
      daculaValinnanTilaCell.getByLabel('Ehdollisuuden syy ruotsiksi'),
    ).toHaveValue('test sv');
    await expect(
      daculaValinnanTilaCell.getByLabel('Ehdollisuuden syy englanniksi'),
    ).toHaveValue('test en');

    await checkRow(
      rows.nth(2),
      [
        '',
        'Purukumi Puru',
        'HYVÄKSYTTYEhdollinen valinta',
        'JulkaistavissaKesken',
        '',
        '',
      ],
      'td',
      false,
    );

    await checkRow(
      rows.nth(3),
      [
        '',
        'Hui Haamu',
        'Valitse...Ehdollinen valinta',
        'JulkaistavissaValitse...',
        '',
        '',
      ],
      'td',
      false,
    );

    await checkRow(
      rows.nth(4),
      [
        '',
        'Ratsu Päätön',
        'Valitse...Ehdollinen valinta',
        'JulkaistavissaValitse...',
        '',
        '',
      ],
      'td',
      false,
    );
  });

  test.describe('Suodattimet', () => {
    test('Nimellä', async ({ page }) => {
      const hakuInput = page.getByRole('textbox', {
        name: 'Hae hakijan nimellä tai tunnisteilla',
      });
      await hakuInput.fill('Ruht');
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Nukettaja Ruhtinas' })).toHaveCount(
        1,
      );
      await hakuInput.fill('Dac');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Dacula Kreivi' })).toHaveCount(1);
    });

    test('Hakemusoidilla', async ({ page }) => {
      const hakuInput = page.getByRole('textbox', {
        name: 'Hae hakijan nimellä tai tunnisteilla',
      });
      await hakuInput.fill('1.2.246.562.11.00000000000001543832');
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Hui Haamu' })).toHaveCount(1);
    });

    test('Henkilöoidilla', async ({ page }) => {
      const hakuInput = page.getByRole('textbox', {
        name: 'Hae hakijan nimellä tai tunnisteilla',
      });
      await hakuInput.fill('1.2.246.562.24.14598775927');
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Purukumi Puru' })).toHaveCount(1);
    });

    test('Valinnan tilalla', async ({ page }) => {
      await selectValinnanTila(page, 'HYLÄTTY');
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Nukettaja Ruhtinas' })).toHaveCount(
        1,
      );
    });

    test('Vastaanoton tilalla', async ({ page }) => {
      await selectOption({
        page,
        name: 'Vastaanoton tila',
        option: 'Vastaanottanut sitovasti',
      });
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.filter({ hasText: 'Dacula Kreivi' })).toHaveCount(1);
    });
  });

  test.describe('Monivalinta ja massamuutos', () => {
    test('Valitsee kaikki hakemukset', async ({ page }) => {
      await expect(page.getByText('Ei hakijoita valittu')).toBeVisible();
      await page.getByLabel('Valitse kaikki').click();
      await expect(page.getByText('5 hakijaa valittu')).toBeVisible();
    });

    test('Valitsee hakemuksia yksitellen', async ({ page }) => {
      await page.getByLabel('Valitse hakijan Dacula Kreivi hakemus').click();
      await expect(page.getByText('1 hakija valittu')).toBeVisible();
      await page.getByLabel('Valitse hakijan Purukumi Puru hakemus').click();
      await expect(page.getByText('2 hakijaa valittu')).toBeVisible();
    });

    test('Massamuutos Valinnan tilalla', async ({ page }) => {
      await page.getByLabel('Valitse kaikki').click();
      await page.getByRole('button', { name: 'Muuta valinnan tila' }).click();
      await page
        .getByRole('menuitem', { name: 'HYVÄKSYTTY', exact: true })
        .click();
      await expect(
        page.getByText('Muutettiin tila 3:lle hakemukselle'),
      ).toBeVisible();
      await expect(page.getByRole('row').getByText('HYVÄKSYTTY')).toHaveCount(
        5,
      );
    });

    test('Massamuutos Vastaanottotilalla', async ({ page }) => {
      await page.getByLabel('Valitse kaikki').click();
      await page
        .getByRole('button', { name: 'Muuta vastaanottotieto' })
        .click();
      await page.getByRole('menuitem', { name: 'Perunut' }).click();
      await expect(
        page.getByText('Muutettiin tila 2:lle hakemukselle'),
      ).toBeVisible();
      await expect(
        page.getByRole('row').getByText('PERUNUT', { exact: true }),
      ).toHaveCount(2);
    });

    test('Massamuutos Ilmoittautumistilalla', async ({ page }) => {
      await page.getByLabel('Valitse kaikki').click();
      await page
        .getByRole('button', { name: 'Muuta ilmoittautumistieto' })
        .click();
      await page.getByRole('menuitem', { name: 'Ei ilmoittautunut' }).click();
      await expect(
        page.getByText('Muutettiin tila 1:lle hakemukselle'),
      ).toBeVisible();
      await expect(
        page.getByRole('row').getByText('Ei ilmoittautunut'),
      ).toHaveCount(1);
    });
  });

  test.describe('Tilojen kentät', () => {
    test('Vastaanottotila disabloitu valinnan tiloilla', async ({ page }) => {
      await page.addStyleTag({
        content: '.MuiMenu-paper { transition-duration: 0s !important}',
      });
      const row = page.locator('tbody tr').nth(3);
      const valinnanTilaCell = row.locator('td').nth(2);
      const vastaanottoTilaCell = row.locator('td').nth(3);
      await vastaanottoTilaCell.getByLabel('Julkaistavissa').click();
      await expect(valinnanTilaCell.getByRole('combobox')).toHaveText(
        'Valitse...',
      );
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeDisabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'HYVÄKSYTTY',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeEnabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'VARASIJALTA HYVÄKSYTTY',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeEnabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'VARALLA',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeDisabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'HYLÄTTY',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeDisabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'PERUUNTUNUT',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeDisabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'PERUNUT',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeEnabled();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'PERUUTETTU',
      });
      await expect(vastaanottoTilaCell.getByRole('combobox')).toBeEnabled();
    });

    test('Vastaanottotilan muutosten vaikutukset valinnan tilaan', async ({
      page,
    }) => {
      await page.addStyleTag({
        content: '.MuiMenu-paper { transition-duration: 0s !important}',
      });
      const row = page.locator('tbody tr').nth(3);
      const valinnanTilaCell = row.locator('td').nth(2);
      const vastaanottoTilaCell = row.locator('td').nth(3);
      await vastaanottoTilaCell.getByLabel('Julkaistavissa').click();
      await selectOption({
        page,
        locator: valinnanTilaCell,
        option: 'HYVÄKSYTTY',
      });

      await selectOption({
        page,
        locator: vastaanottoTilaCell,
        option: 'Vastaanottanut sitovasti',
      });

      await expect(valinnanTilaCell.getByRole('combobox')).toHaveText(
        'HYVÄKSYTTY',
      );
      await expect(valinnanTilaCell.getByRole('combobox')).toBeDisabled();

      await selectOption({
        page,
        locator: vastaanottoTilaCell,
        option: 'Ei vastaanotettu määräaikana',
      });

      await expect(valinnanTilaCell.getByRole('combobox')).toHaveText(
        'PERUUNTUNUT',
      );
      await expect(valinnanTilaCell.getByRole('combobox')).toBeDisabled();

      await selectOption({
        page,
        locator: vastaanottoTilaCell,
        option: 'Perunut',
      });

      await expect(valinnanTilaCell.getByRole('combobox')).toHaveText(
        'PERUNUT',
      );
      await expect(valinnanTilaCell.getByRole('combobox')).toBeDisabled();

      await selectOption({
        page,
        locator: vastaanottoTilaCell,
        option: 'Peruutettu',
      });

      await expect(valinnanTilaCell.getByRole('combobox')).toHaveText(
        'PERUUTETTU',
      );
      await expect(valinnanTilaCell.getByRole('combobox')).toBeDisabled();
    });
  });
});

test.describe('Tallennus', () => {
  test('Ilmoittaa ettei ole mitään tallennettavaa', async ({ page }) => {
    await page.getByRole('button', { name: 'Tallenna', exact: true }).click();
    await expectAllSpinnersHidden(page);
    await expect(page.getByText('Ei muutoksia mitä tallentaa')).toBeVisible();
  });

  test('Tallentaa muutokset', async ({ page }) => {
    await mockDocumentProcess({
      page,
      urlMatcher: (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
        ),
    });
    const rows = page.locator('tbody tr');
    await selectOption({
      page,
      locator: rows.nth(0).getByRole('cell').nth(2),
      option: 'HYVÄKSYTTY',
    });

    await page.getByRole('button', { name: 'Tallenna', exact: true }).click();
    await expect(
      page.getByText('Valintaesityksen muutokset tallennettu'),
    ).toBeVisible();
  });

  test('Tallennus epäonnistuu', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
        ),
      (route) =>
        route.fulfill({
          status: 500,
          body: 'Unknown error',
        }),
    );
    const rows = page.locator('tbody tr');
    await selectOption({
      page,
      locator: rows.nth(0).getByRole('cell').nth(2),
      option: 'HYVÄKSYTTY',
    });
    await page.getByRole('button', { name: 'Tallenna', exact: true }).click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(page.getByText('Unknown error')).toBeVisible();
  });

  test('Tallennus epäonnistuu osittain', async ({ page }) => {
    await mockDocumentProcess({
      page,
      urlMatcher: (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
        ),
      documentId: 'doc_id',
      processResponse: {
        json: {
          dokumenttiId: 'doc_id',
          kasittelyssa: false,
          keskeytetty: true,
          kokonaistyo: { valmis: true },
          poikkeukset: [
            {
              tunnisteet: [
                {
                  tunniste: '1.2.246.562.11.00000000000001796027',
                  tyyppi: 'hakemusOid',
                },
              ],
              palvelu: 'testi-palvelu',
              viesti: 'testi-virheviesti',
              palvelukutsu: 'testi-palvelukutsu',
            },
          ],
          varoitukset: [],
        },
      },
    });
    await page.getByLabel('Valitse kaikki').click();
    await page.getByRole('button', { name: 'Muuta valinnan tila' }).click();
    await page
      .getByRole('menuitem', { name: 'HYVÄKSYTTY', exact: true })
      .click();
    await page.getByRole('button', { name: 'Tallenna', exact: true }).click();

    const errorModal = page.getByRole('dialog', {
      name: 'Tietojen tallentamisessa tapahtui virhe.',
    });
    await expect(errorModal).toBeVisible();
    await expect(
      errorModal.getByRole('cell', { name: 'testi-virheviesti' }),
    ).toBeVisible();
  });

  test.describe('Valintaesityksen hyväksyminen', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        /\/valinta-tulos-service\/auth\/valintaesitys\/\S+\/hyvaksytty/,
        async (route) => route.fulfill({ json: {} }),
      );
    });
    test('Hyväksy', async ({ page }) => {
      await mockDocumentProcess({
        page,
        urlMatcher: (url) =>
          url.pathname.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
      });
      await page.getByRole('button', { name: 'Hyväksy ja tallenna' }).click();
      await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
    });

    test('Tee muutos ja hyväksy', async ({ page }) => {
      await mockDocumentProcess({
        page,
        urlMatcher: (url) =>
          url.pathname.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
      });
      const rows = page.locator('tbody tr');
      await selectOption({
        page,
        locator: rows.nth(0).getByRole('cell').nth(2),
        option: 'HYVÄKSYTTY',
      });
      await page.getByRole('button', { name: 'Hyväksy ja tallenna' }).click();
      await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
    });

    test('Epäonnistuu muutoksia tallentaessa', async ({ page }) => {
      await page.route(
        (url) =>
          url.pathname.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
        (route) =>
          route.fulfill({
            status: 500,
            body: 'Unknown error',
          }),
      );
      const rows = page.locator('tbody tr');
      await selectOption({
        page,
        locator: rows.nth(0).getByRole('cell').nth(2),
        option: 'HYVÄKSYTTY',
      });
      await page.getByRole('button', { name: 'Hyväksy ja tallenna' }).click();
      await expect(
        page.getByText('Tietojen tallentamisessa tapahtui virhe'),
      ).toBeVisible();
      await expect(page.getByText('Unknown error')).toBeVisible();
    });

    test('Hyväksyntä epäonnistuu', async ({ page }) => {
      await page.route(
        /\/valinta-tulos-service\/auth\/valintaesitys\/\S+\/hyvaksytty/,
        async (route) => route.fulfill({ status: 500, body: 'Räjähti' }),
      );
      await page.getByRole('button', { name: 'Hyväksy ja tallenna' }).click();
      await expect(
        page.getByText('Tietojen tallentamisessa tapahtui virhe'),
      ).toBeVisible();
      await expect(page.getByText('Räjähti')).toBeVisible();
    });
  });

  test.describe('Hakemuksen muut toiminnot', () => {
    test('Näytä muutoshistoria', async ({ page }) => {
      await testNaytaMuutoshistoria(page);
    });

    test('Muodosta hyväksymiskirje', async ({ page }) => {
      await testMuodostaHakemusHyvaksymiskirje(page);
    });

    test('Lähetä vastaanottoposti', async ({ page }) => {
      await page.route(
        '*/**/valinta-tulos-service/auth/emailer/run/hakemus/1.2.246.562.11.00000000000001796027',
        async (route) => {
          await route.fulfill({
            status: 200,
            json: ['1.2.246.562.11.00000000000001796027'],
          });
        },
      );
      await page
        .getByRole('row', { name: 'Nukettaja Ruhtinas' })
        .getByRole('button', { name: 'Muut toiminnot' })
        .click();
      await expect(
        page.getByRole('menuitem', {
          name: 'Lähetä vastaanottoposti',
          exact: true,
        }),
      ).toBeVisible();
      await page.getByText('Lähetä vastaanottoposti', { exact: true }).click();
      await expect(
        page.getByText('Sähköpostin lähetys onnistui'),
      ).toBeVisible();
    });

    test('Merkitse myöhästyneeksi', async ({ page }) => {
      const merkitseMyohastyneeksiButton = page.getByRole('button', {
        name: 'Merkitse myöhästyneeksi',
      });
      await expect(merkitseMyohastyneeksiButton).toBeEnabled();
      const myohastynytHakemusRow = page.getByRole('row', {
        name: 'Purukumi Puru',
      });
      await myohastynytHakemusRow
        .getByRole('checkbox', { name: 'Ehdollinen valinta' })
        .click();
      await merkitseMyohastyneeksiButton.click();
      const confirmModal = page.getByRole('dialog', {
        name: 'Vahvista myöhästyneeksi merkitseminen',
      });
      const confirmationDataRows = confirmModal
        .getByRole('row')
        .filter({ has: page.locator('td') });

      await expect(confirmationDataRows).toHaveCount(1);
      await expect(confirmationDataRows.nth(0)).toContainText('Purukumi Puru');

      const [request] = await Promise.all([
        waitForMethodRequest(page, 'POST', (url) =>
          url.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
        ),
        confirmModal
          .getByRole('button', { name: 'Merkitse myöhästyneeksi' })
          .click(),
      ]);

      const postDataRivit = request.postDataJSON()?.rivit;
      expect(postDataRivit).toHaveLength(1);
      expect(postDataRivit[0]).toMatchObject({
        hakemusOid: '1.2.246.562.11.00000000000001790371',
        personOid: '1.2.246.562.24.14598775927',
        hakemuksenTila: 'HYVAKSYTTY',
        vastaanottoTila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
        ilmoittautumisTila: IlmoittautumisTila.EI_TEHTY,
        julkaistaankoTiedot: true,
        ehdollisestiHyvaksyttavissa: false,
      });
    });

    test('Poista hakemus', async ({ page }) => {
      await mockDocumentProcess({
        page,
        urlMatcher: (url) =>
          url.pathname.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
      });
      await page
        .getByRole('row', { name: 'Nukettaja Ruhtinas' })
        .getByRole('button', { name: 'Muut toiminnot' })
        .click();
      await page
        .getByRole('menuitem', { name: 'Poista valinnan tulokset' })
        .click();
      const confirmModal = page.getByRole('dialog', {
        name: 'Poistetaanko valinnan tulokset?',
      });

      const [request] = await Promise.all([
        waitForMethodRequest(page, 'POST', (url) =>
          url.includes(
            '/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui',
          ),
        ),
        confirmModal
          .getByRole('button', { name: 'Poista valinnan tulokset' })
          .click(),
      ]);

      const postDataRivit = request.postDataJSON()?.rivit;
      expect(postDataRivit).toHaveLength(1);
      expect(postDataRivit[0]).toMatchObject({
        hakemusOid: '1.2.246.562.11.00000000000001796027',
        personOid: '1.2.246.562.24.69259807406',
        poistetaankoRivi: true,
      });
      await expect(page.getByText('Valinnan tulokset poistettu')).toBeVisible();
    });
  });

  test('Lähetä vastaanottoposti', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/emailer/run/hakukohde/1.2.246.562.20.00000000000000045105',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: ['1.2.246.562.20.00000000000000045105'],
        });
      },
    );
    await page
      .getByRole('button', { name: 'Lähetä vastaanottoposti hakukohteelle' })
      .click();
    await expect(page.getByText('Sähköpostin lähetys onnistui')).toBeVisible();
  });
});
