import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  selectOption,
} from './playwright-utils';
import { configuration } from '@/app/lib/configuration';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

test.beforeEach(async ({ page }) => await goToSijoittelunTulokset(page));

test('näytä "Sijoittelun tulokset" -välilehti ja sisältö', async ({ page }) => {
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
      'JulkaistavissaKesken',
      '',
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
    ['', '3', 'Purukumi Puru', '0', '49', 'VARALLA (1)', 'Julkaistavissa'],
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

test('ehdollista hyväksyntää ja maksukolumnia ei näytetä toisen asteen yhteishaulla', async ({
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

test('näyttää muut valinnat ehdollisuuden syylle', async ({ page }) => {
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

test.describe('suodattimet', () => {
  test('nimellä', async ({ page }) => {
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

  test('hakemustunnisteella', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('henkilötunnisteella', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });

  test('julkaisutilalla VARALLA', async ({ page }) => {
    await selectTila(page, 'VARALLA');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });

  test('julkaisutilalla HYLÄTTY', async ({ page }) => {
    await selectTila(page, 'HYLÄTTY');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('vain muuttuneet hakemukset', async ({ page }) => {
    await page.getByLabel('Näytä vain edellisestä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '', 'Hui Haamu']);
  });

  test('ehdollisesti hyväksytyt hakemukset', async ({ page }) => {
    await page.getByLabel('Näytä vain ehdollisesti hyvä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['', '3', 'Purukumi Puru']);
  });
});

test.describe('monivalinta ja massamuutos', () => {
  test('valitsee kaikki hakemukset', async ({ page }) => {
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(2);
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByLabel('Valitse kaikki')
      .click();
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(1);
    await expect(page.getByText('Hakijoita valittu: 3')).toBeVisible();
  });

  test('valitsee hakemuksia', async ({ page }) => {
    await page.getByLabel('Valitse hakijan Dacula Kreivi').click();
    await expect(page.getByText('Hakijoita valittu: 1')).toBeVisible();
    await page.getByLabel('Valitse hakijan Purukumi Puru').click();
    await expect(page.getByText('Hakijoita valittu: 2')).toBeVisible();
  });

  test('massamuutos vastaanottotiedolla', async ({ page }) => {
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

  test('massamuutos ilmoittautumistiedolla', async ({ page }) => {
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
      page.getByText('Muutettiin tila 1 hakemukselle'),
    ).toBeVisible();
    await expect(
      page.getByRole('row').getByText('Ei ilmoittautunut'),
    ).toHaveCount(1);
  });
});

test.describe('tallennus', () => {
  test('ilmoittaa ettei ole mitään tallennettavaa', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expectAllSpinnersHidden(page);
    await expect(page.getByText('Ei muutoksia mitä tallentaa')).toBeVisible();
  });

  test('tallentaa muutokset', async ({ page }) => {
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Valintaesityksen muutokset tallennettu'),
    ).toBeVisible();
  });

  test('tallennus epäonnistuu', async ({ page }) => {
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

  test('tallennus epäonnistuu osittain', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/valinnan-tulos/valintatapajono-yo',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: [
            {
              hakemusOid: '1.2.246.562.11.00000000000001796027',
              message: 'Vastaanottoa ei voi poistaa koska ilmoitus on tehty',
            },
          ],
        });
      },
    );
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByLabel('Valitse kaikki')
      .click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByText('Muuta vastaanottotieto')
      .click();
    await page.getByRole('option', { name: 'Perunut' }).click();
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe.'),
    ).toBeVisible();
    await expect(
      page.getByText('Vastaanottoa ei voi poistaa koska ilmoitus on tehty'),
    ).toBeVisible();
  });
});

test.describe('valintaesityksen hyväksyminen', () => {
  test('hyväksy', async ({ page }) => {
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('tee muutos ja hyväksy', async ({ page }) => {
    await selectOption(page, 'Ilmoittautumistieto', 'Ei ilmoittautunut');
    await page
      .locator('[data-test-id="sijoittelun-tulokset-form-valintatapajono-yo"]')
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('epäonnistuu muutoksia tallentaessa', async ({ page }) => {
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

  test('hyväksyntä epäonnistuu', async ({ page }) => {
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

test.describe('hakemuksen muut toiminnot', () => {
  test('näytä muutoshistoria', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/muutoshistoria*',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: [
            {
              changes: [
                {
                  field: 'valinnantilanViimeisinMuutos',
                  from: '2024-05-14T09:52:43.341+03:00',
                  to: '2024-10-02T14:38:11.336+03:00',
                },
                {
                  field: 'valinnantila',
                  from: 'HYLATTY',
                  to: 'PERUUNTUNUT',
                },
              ],
              timestamp: '2024-10-02T14:36:00.955506+03:00',
            },
            {
              changes: [
                {
                  field: 'valinnantilanViimeisinMuutos',
                  to: '2024-05-14T09:52:43.341+03:00',
                },
                {
                  field: 'valinnantila',
                  to: 'HYLATTY',
                },
                {
                  field: 'hyvaksyttyVarasijalta',
                  to: false,
                },
                {
                  field: 'hyvaksyPeruuntunut',
                  to: false,
                },
                {
                  field: 'julkaistavissa',
                  to: false,
                },
              ],
              timestamp: '2024-05-14T09:52:41.927195+03:00',
            },
          ],
        });
      },
    );
    await page
      .getByRole('row', { name: 'Nukettaja Ruhtinas' })
      .getByRole('button', { name: 'Muut toiminnot' })
      .click();
    await expect(page.getByText('Muutoshistoria')).toBeVisible();
    await page.getByText('Muutoshistoria').click();
    await expect(page.getByText('Muokkausajankohta')).toBeVisible();
    await expect(page.getByLabel('Muutoshistoria')).toContainText(
      'Sijoittelun tila: Peruuntunut',
    );
    await expect(page.getByLabel('Muutoshistoria')).toContainText(
      'Sijoittelun tila: Hylätty',
    );
    await page.getByText('Sulje').click();
    await expect(page.getByText('Muokkausajankohta')).toBeHidden();
  });

  test('muodosta hyväksymiskirje', async ({ page }) => {
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi*',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: { id: 'dokumentti_id' },
        });
      },
    );
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/dokumentti_id',
      async (route) => {
        const readyProcess = {
          kokonaistyo: { valmis: true },
          dokumenttiId: 'dokumentti_id',
        };
        await route.fulfill({
          status: 200,
          json: readyProcess,
        });
      },
    );
    await page
      .getByRole('row', { name: 'Nukettaja Ruhtinas' })
      .getByRole('button', { name: 'Muut toiminnot' })
      .click();
    await expect(
      page.getByText('Hyväksymiskirje', { exact: true }),
    ).toBeVisible();
    await page.getByText('Hyväksymiskirje', { exact: true }).click();
    await expect(
      page.getByText('Hyväksymiskirjeen muodostaminen'),
    ).toBeVisible();
    await page.getByPlaceholder('pp.kk.vvvv hh.mm').click();
    await page.getByLabel('Choose lauantaina 15.').click();
    await page.getByRole('option', { name: '15.30' }).click();
    await expect(page.getByPlaceholder('pp.kk.vvvv hh.mm')).toHaveValue(
      '15.02.2025 15:30',
    );
    await page.getByRole('button', { name: 'Muodosta kirje' }).click();
    await expect(page.getByRole('button', { name: 'Lataa' })).toBeVisible();
  });

  test('lähetä vastaanottoposti', async ({ page }) => {
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
      page.getByText('Lähetä vastaanottoposti', { exact: true }),
    ).toBeVisible();
    await page.getByText('Lähetä vastaanottoposti', { exact: true }).click();
    await expect(page.getByText('Sähköpostin lähetys onnistui')).toBeVisible();
  });

  test('merkitse myöhästyneeksi', async ({ page }) => {
    const yoAccordionContent = page.getByRole('region', {
      name: 'Todistusvalinta (YO)',
    });

    const ammAccordionContent = page.getByRole('region', {
      name: 'Todistusvalinta (AMM)',
    });

    const ammMerkitseMyohastyneeksiButton = ammAccordionContent.getByRole(
      'button',
      {
        name: 'Merkitse myöhästyneeksi',
      },
    );

    await expect(ammMerkitseMyohastyneeksiButton).toBeDisabled();

    const yoMerkitseMyohastyneeksiButton = yoAccordionContent.getByRole(
      'button',
      {
        name: 'Merkitse myöhästyneeksi',
      },
    );

    const nukettajaRow = yoAccordionContent.getByRole('row', {
      name: 'Nukettaja Ruhtinas',
    });
    await nukettajaRow
      .getByRole('checkbox', { name: 'Ehdollinen valinta' })
      .click();

    const daculaRow = yoAccordionContent.getByRole('row', {
      name: 'Dacula Kreivi',
    });
    await selectOption(page, 'Ilmoittautumistieto', 'Ei tehty', daculaRow);

    await expect(yoMerkitseMyohastyneeksiButton).toBeEnabled();

    await yoMerkitseMyohastyneeksiButton.click();

    const merkitseMyohastyneeksiConfirmModal = page.getByRole('dialog', {
      name: 'Vahvista myöhästyneeksi merkitseminen',
    });

    const confirmationDataRows = merkitseMyohastyneeksiConfirmModal
      .getByRole('row')
      .filter({ has: page.locator('td') });

    await expect(confirmationDataRows).toHaveCount(1);
    await expect(confirmationDataRows.nth(0)).toContainText('Nukettaja Ruhtinas');

    const [request] = await Promise.all([
      page.waitForRequest(
        (request) =>
          request
            .url()
            .includes('/valinta-tulos-service/auth/valinnan-tulos') &&
          request.method() === 'PATCH',
      ),
      page.getByRole('button', { name: 'Merkitse myöhästyneeksi' }).click(),
    ]);

    const postData = request.postDataJSON();
    expect(postData).toHaveLength(1);

    expect(postData[0]).toMatchObject({
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
      valintatapajonoOid: 'valintatapajono-yo',
      hakemusOid: '1.2.246.562.11.00000000000001796027',
      henkiloOid: '1.2.246.562.24.69259807406',
      vastaanottotila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
      valinnantila: 'HYVAKSYTTY',
      ilmoittautumistila: IlmoittautumisTila.EI_TEHTY,
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      hyvaksyttyVarasijalta: false,
      hyvaksyPeruuntunut: false,
    });
  });
});

test.describe('hakukohteen muut toiminnot', () => {
  test('tiedostojen latausvaihtoehdot eivät ole sallittuja', async ({
    page,
  }) => {
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(page.getByText('Lataa hyväksymiskirjeet')).toBeDisabled();
    await expect(page.getByText('Lataa osoitetarrat')).toBeDisabled();
    await expect(page.getByText('Lataa tulokset')).toBeDisabled();
  });

  test('lähetä vastaanottoposti', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/emailer/run/hakukohde/1.2.246.562.20.00000000000000045105',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: ['1.2.246.562.20.00000000000000045105'],
        });
      },
    );
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(
      page.getByText('Lähetä vastaanottoposti hakukohteelle'),
    ).toBeVisible();
    await page.getByText('Lähetä vastaanottoposti hakukohteelle').click();
    await expect(page.getByText('Sähköpostien lähetys onnistui')).toBeVisible();
  });

  test('muodosta hyväksymiskirjeet', async ({ page }) => {
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi*',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: { id: 'dokumentti_id' },
        });
      },
    );
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/dokumentti_id',
      async (route) => {
        const readyProcess = {
          kokonaistyo: { valmis: true },
          dokumenttiId: 'dokumentti_id',
        };
        await route.fulfill({
          status: 200,
          json: readyProcess,
        });
      },
    );
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(page.getByText('Muodosta hyväksymiskirjeet')).toBeVisible();
    await page.getByText('Muodosta hyväksymiskirjeet').click();
    await page.getByLabel('Vain ne hyväksytyt, jotka eiv').click();
    await expect(
      page.getByText('Hyväksymiskirjeiden muodostaminen'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Muodosta kirjeet' }).click();
    await expect(page.getByRole('button', { name: 'Lataa' })).toBeVisible();
    await page.getByLabel('Sulje').click();
    await expect(
      page.getByText('Hyväksymiskirjeiden muodostaminen'),
    ).toBeHidden();
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(page.getByText('Lataa hyväksymiskirjeet')).toBeEnabled();
  });

  test('muodosta kirjeet ei-hyväksytyille', async ({ page }) => {
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/hakukohteessahylatyt/aktivoi*',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: { id: 'dokumentti_id' },
        });
      },
    );
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/dokumentti_id',
      async (route) => {
        const readyProcess = {
          kokonaistyo: { valmis: true },
          dokumenttiId: 'dokumentti_id',
        };
        await route.fulfill({
          status: 200,
          json: readyProcess,
        });
      },
    );
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(
      page.getByText('Muodosta kirjeet ei-hyväksytyille'),
    ).toBeVisible();
    await page.getByText('Muodosta kirjeet ei-hyväksytyille').click();
    await expect(
      page.getByText('Ei-hyväksymiskirjeiden muodostaminen'),
    ).toBeVisible();
    await page.getByText('Terve suuri aatelinen!').fill('Purkka lopussa');
    await page.getByRole('button', { name: 'Muodosta kirjeet' }).click();
    await expect(page.getByRole('button', { name: 'Lataa' })).toBeVisible();
  });

  test('muodosta osoitetarrat', async ({ page }) => {
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/sijoittelussahyvaksytyille/aktivoi*',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: { id: 'dokumentti_id_tarrat' },
        });
      },
    );
    await page.route(
      '*/**/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/dokumentti_id_tarrat',
      async (route) => {
        const readyProcess = {
          kokonaistyo: { valmis: true },
          dokumenttiId: 'dokumentti_id_tarrat',
        };
        await route.fulfill({
          status: 200,
          json: readyProcess,
        });
      },
    );
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(
      page.getByText('Muodosta hyväksytyille osoitetarrat'),
    ).toBeVisible();
    await page.getByText('Muodosta hyväksytyille osoitetarrat').click();
    await expect(page.getByText('Osoitetarrojen muodostaminen')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lataa' })).toBeVisible();
    await page.getByLabel('Sulje').click();
    await expect(page.getByText('Osoitetarrojen muodostaminen')).toBeHidden();
    await page.getByLabel('Muut toiminnot hakukohteelle').click();
    await expect(page.getByText('Lataa osoitetarrat')).toBeEnabled();
  });
});

async function goToSijoittelunTulokset(page: Page) {
  await page.clock.setFixedTime(new Date('2025-02-05T12:00:00'));
  await page.route(
    configuration.myohastyneetHakemuksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    }),
    async (route) => {
      await route.fulfill({
        json: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            mennyt: true,
            vastaanottoDeadline: '2022-03-18T13:00:00.000Z',
          },
        ],
      });
    },
  );
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
