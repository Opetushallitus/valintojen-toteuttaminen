import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  findTableColumnIndexByTitle,
  mockDocumentProcess,
  selectOption,
  testMuodostaHakemusHyvaksymiskirje,
  testNaytaMuutoshistoria,
} from './playwright-utils';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';

async function goToSijoittelunTulokset(page: Page) {
  await page.clock.setFixedTime(new Date('2025-02-05T12:00:00'));
  await page.route(
    '**/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/myohastyneet/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
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

async function selectTila(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Sijoittelun tila',
    option,
  });
}

test.beforeEach(async ({ page }) => await goToSijoittelunTulokset(page));

const getYoValintatapajonoContent = (page: Page) => {
  return page.getByRole('region', { name: 'Todistusvalinta (YO)' });
};

const getAmmValintatapajonoContent = (page: Page) => {
  return page.getByRole('region', { name: 'Todistusvalinta (AMM)' });
};

test('Näytä "Sijoittelun tulokset" -välilehti ja sisältö', async ({ page }) => {
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
  const firstAccordion = getYoValintatapajonoContent(page);
  const firstAccordionHeadRow = firstAccordion.locator('thead tr');
  await checkRow(
    firstAccordionHeadRow,
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
  const rows = firstAccordion.locator('tbody tr');
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

  const secondAccordion = getAmmValintatapajonoContent(page);
  const secondAccordionHeadRow = secondAccordion.locator('thead tr');
  await checkRow(
    secondAccordionHeadRow,
    [
      '',
      'Jonosija',
      'Hakija',
      'Hakutoive',
      'Sijoittelun tila',
      'Vastaanottotieto',
      'Ilmoittautumistieto',
      'Maksun tila',
      'Toiminnot',
    ],
    'th',
  );
  const rows2nd = secondAccordion.locator('tbody tr');
  await expect(rows2nd).toHaveCount(1);
  await checkRow(
    rows2nd.nth(0),
    ['', '', 'Hui Haamu', '0', 'HYLÄTTY'],
    'td',
    false,
  );

  await expect(page.getByText('Hakijalle näytetään: Kesken')).toBeVisible();
});

test('Näytä info-ikoni ja tooltip sitä klikattaessa vain toisesta valintatapajonosta siirtyneelle hakemukselle', async ({
  page,
}) => {
  const yoAccordionContent = getYoValintatapajonoContent(page);
  const contentRows = yoAccordionContent.locator('tbody tr');
  const contentRowsLength = await contentRows.count();
  const sijoittelunTilaColumnIndex = await findTableColumnIndexByTitle(
    yoAccordionContent,
    'Sijoittelun tila',
  );

  for (let i = 0; i < contentRowsLength; i++) {
    const row = contentRows.nth(i);
    const sijoittelunTilaCell = row
      .getByRole('cell')
      .nth(sijoittelunTilaColumnIndex);
    const infoButton = sijoittelunTilaCell.getByRole('button', {
      name: 'Lisätietoja',
    });
    const rowText = await row.textContent();
    if (rowText?.includes('Nukettaja Ruhtinas')) {
      // Hakemukselle asetettu testidatassa siirtynytToisestaValintatapajonosta = true
      const tooltip = page.getByRole('tooltip').filter({
        hasText: 'Hakemus on siirtynyt toisesta valintatapajonosta',
      });
      await expect(infoButton).toBeVisible();
      await infoButton.click();
      await expect(tooltip).toBeVisible();
      await tooltip.getByRole('button', { name: 'Sulje' }).click();
      await expect(tooltip).toBeHidden();
    } else {
      await expect(infoButton).toBeHidden();
    }
  }
});

test('Ehdollista hyväksyntää ja maksusaraketta ei näytetä toisen asteen yhteishaulla', async ({
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

test('Näyttää muut valinnat ehdollisuuden syylle', async ({ page }) => {
  const nukettajaRow = getYoValintatapajonoContent(page)
    .getByRole('row')
    .nth(1);
  await nukettajaRow.getByLabel('Ehdollinen valinta').click();
  await expect(nukettajaRow.getByText('Valitse...')).toBeVisible();
  await nukettajaRow.getByText('Valitse...').click();
  await expect(page.getByRole('option', { name: 'Muu' })).toBeVisible();
  await page.getByRole('option', { name: 'Muu' }).click();
  await expect(
    nukettajaRow.getByLabel('Ehdollisuuden syy suomeksi'),
  ).toBeVisible();
  await expect(
    nukettajaRow.getByLabel('Ehdollisuuden syy ruotsiksi'),
  ).toBeVisible();
  await expect(
    nukettajaRow.getByLabel('Ehdollisuuden syy englanniksi'),
  ).toBeVisible();
});

test.describe('Suodattimet', () => {
  test('Nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Nukettaja Ruhtinas' })).toHaveCount(1);
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

  test('Julkaisutilalla VARALLA', async ({ page }) => {
    await selectTila(page, 'VARALLA');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Purukumi Puru' })).toHaveCount(1);
  });

  test('Julkaisutilalla HYLÄTTY', async ({ page }) => {
    await selectTila(page, 'HYLÄTTY');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Hui Haamu' })).toHaveCount(1);
  });

  test('Vain muuttuneet hakemukset', async ({ page }) => {
    await page.getByLabel('Näytä vain edellisestä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Hui Haamu' })).toHaveCount(1);
  });

  test('Ehdollisesti hyväksytyt hakemukset', async ({ page }) => {
    await page.getByLabel('Näytä vain ehdollisesti hyvä').click();
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Purukumi Puru' })).toHaveCount(1);
  });
});

test.describe('Monivalinta ja massamuutos', () => {
  test('Valitsee kaikki hakemukset', async ({ page }) => {
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(2);
    await getYoValintatapajonoContent(page)
      .getByLabel('Valitse kaikki')
      .click();
    await expect(page.getByText('Ei hakijoita valittu')).toHaveCount(1);
    await expect(page.getByText('3 hakijaa valittu')).toBeVisible();
  });

  test('Valitsee hakemuksia', async ({ page }) => {
    await page.getByLabel('Valitse hakijan Dacula Kreivi').click();
    await expect(page.getByText('1 hakija valittu')).toBeVisible();
    await page.getByLabel('Valitse hakijan Purukumi Puru').click();
    await expect(page.getByText('2 hakijaa valittu')).toBeVisible();
  });

  test('Massamuutos vastaanottotiedolla', async ({ page }) => {
    await getYoValintatapajonoContent(page)
      .getByLabel('Valitse kaikki')
      .click();
    await getYoValintatapajonoContent(page)
      .getByText('Muuta vastaanottotieto')
      .click();
    await page.getByRole('option', { name: 'Perunut' }).click();
    await expect(
      page.getByText('Muutettiin tila 2 hakemukselle'),
    ).toBeVisible();
    await expect(page.getByRole('row').getByText('Perunut')).toHaveCount(2);
  });

  test('Massamuutos ilmoittautumistiedolla', async ({ page }) => {
    await getYoValintatapajonoContent(page)
      .getByLabel('Valitse kaikki')
      .click();
    await getYoValintatapajonoContent(page)
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

test.describe('Tallennus', () => {
  test('Ilmoittaa ettei ole mitään tallennettavaa', async ({ page }) => {
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expectAllSpinnersHidden(page);
    await expect(page.getByText('Ei muutoksia mitä tallentaa')).toBeVisible();
  });

  test('Tallentaa muutokset', async ({ page }) => {
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Valintaesityksen muutokset tallennettu'),
    ).toBeVisible();
  });

  test('Tallennus epäonnistuu', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/lukuvuosimaksu/1.2.246.562.20.00000000000000045105*',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Unknown error' });
      },
    );
    await page.getByText('Maksamatta').click();
    await page.getByRole('option', { name: 'Maksettu' }).click();
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Tallenna', exact: true })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(page.getByText('Unknown error')).toBeVisible();
  });

  test('Tallennus epäonnistuu osittain', async ({ page }) => {
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
    await getYoValintatapajonoContent(page)
      .getByLabel('Valitse kaikki')
      .click();
    await getYoValintatapajonoContent(page)
      .getByText('Muuta vastaanottotieto')
      .click();
    await page.getByRole('option', { name: 'Perunut' }).click();
    await getYoValintatapajonoContent(page)
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

test.describe('Valintaesityksen hyväksyminen', () => {
  test('Hyväksy', async ({ page }) => {
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('Tee muutos ja hyväksy', async ({ page }) => {
    await selectOption({
      page,
      name: 'Ilmoittautumistieto',
      option: 'Ei ilmoittautunut',
    });
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(page.getByText('Valintaesitys hyväksytty')).toBeVisible();
  });

  test('Epäonnistuu muutoksia tallentaessa', async ({ page }) => {
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
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
    await expect(
      page.getByText('Tietojen tallentamisessa tapahtui virhe'),
    ).toBeVisible();
    await expect(
      page.getByText('Kumma syy taustajärjestelmästä'),
    ).toBeVisible();
  });

  test('Hyväksyntä epäonnistuu', async ({ page }) => {
    await page.route(
      '*/**/valinta-tulos-service/auth/valintaesitys/valintatapajono-yo/hyvaksytty*',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Räjähti' });
      },
    );
    await getYoValintatapajonoContent(page)
      .getByRole('button', { name: 'Hyväksy ja tallenna' })
      .click();
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
      page.getByText('Lähetä vastaanottoposti', { exact: true }),
    ).toBeVisible();
    await page.getByText('Lähetä vastaanottoposti', { exact: true }).click();
    await expect(page.getByText('Sähköpostin lähetys onnistui')).toBeVisible();
  });

  test('Merkitse myöhästyneeksi', async ({ page }) => {
    const yoAccordionContent = getYoValintatapajonoContent(page);
    const ammAccordionContent = getAmmValintatapajonoContent(page);
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
    await selectOption({
      page,
      locator: daculaRow,
      name: 'Ilmoittautumistieto',
      option: 'Ei tehty',
    });
    await expect(yoMerkitseMyohastyneeksiButton).toBeEnabled();
    await yoMerkitseMyohastyneeksiButton.click();
    const confirmModal = page.getByRole('dialog', {
      name: 'Vahvista myöhästyneeksi merkitseminen',
    });
    const confirmationDataRows = confirmModal
      .getByRole('row')
      .filter({ has: page.locator('td') });

    await expect(confirmationDataRows).toHaveCount(1);
    await expect(confirmationDataRows.nth(0)).toContainText(
      'Nukettaja Ruhtinas',
    );

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes('/valinta-tulos-service/auth/valinnan-tulos') &&
          req.method() === 'PATCH',
      ),
      confirmModal
        .getByRole('button', { name: 'Merkitse myöhästyneeksi' })
        .click(),
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

test.describe('Hakukohteen muut toiminnot', () => {
  test('Tiedostojen latausvaihtoehdot eivät ole sallittuja', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    await expect(
      page.getByRole('menuitem', { name: 'Lataa hyväksymiskirjeet' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('menuitem', { name: 'Lataa osoitetarrat' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('menuitem', { name: 'Lataa tulokset' }),
    ).toBeDisabled();
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
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    await expect(
      page.getByText('Lähetä vastaanottoposti hakukohteelle'),
    ).toBeVisible();
    await page.getByText('Lähetä vastaanottoposti hakukohteelle').click();
    await expect(page.getByText('Sähköpostin lähetys onnistui')).toBeVisible();
  });

  test('Muodosta hyväksymiskirjeet', async ({ page }) => {
    await mockDocumentProcess({
      page,
      urlMatcher:
        '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi*',
    });
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
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
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    await expect(page.getByText('Lataa hyväksymiskirjeet')).toBeEnabled();
  });

  test('Muodosta kirjeet ei-hyväksytyille', async ({ page }) => {
    await mockDocumentProcess({
      page,
      urlMatcher:
        '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/hakukohteessahylatyt/aktivoi*',
    });
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
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

  test('Muodosta osoitetarrat', async ({ page }) => {
    await mockDocumentProcess({
      page,
      urlMatcher:
        '*/**/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/sijoittelussahyvaksytyille/aktivoi*',
      documentId: 'documentti_id_tarrat',
    });
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    await expect(
      page.getByText('Muodosta hyväksytyille osoitetarrat'),
    ).toBeVisible();
    await page.getByText('Muodosta hyväksytyille osoitetarrat').click();
    await expect(page.getByText('Osoitetarrojen muodostaminen')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lataa' })).toBeVisible();
    await page.getByLabel('Sulje').click();
    await expect(page.getByText('Osoitetarrojen muodostaminen')).toBeHidden();
    await page
      .getByRole('button', { name: 'Muut toiminnot hakukohteelle' })
      .click();
    await expect(page.getByText('Lataa osoitetarrat')).toBeEnabled();
  });
});
