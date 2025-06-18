import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAlertTextVisible,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  selectOption,
} from './playwright-utils';
import LASKETUT_VALINNANVAIHEET from './fixtures/lasketut-valinnanvaiheet.json';
import { TuloksenTila } from '@/lib/types/laskenta-types';
import { NDASH } from '@/lib/constants';

const JONO_TABLE_HEADINGS = [
  'Jonosija',
  'Hakija',
  'Pisteet',
  'Hakutoive',
  'Valintatieto',
  'Kuvaus',
];

const DACULA_HAKEMUS_OID = '1.2.246.562.11.00000000000001793706';

test.beforeEach(async ({ page }) => {
  await page.route(
    /valintalaskenta-laskenta-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
    async (route) => await route.fulfill({ json: LASKETUT_VALINNANVAIHEET }),
  );

  await page.route(
    /valintaperusteet-service\/resources\/hakukohde\/\S+\/valinnanvaihe/,
    async (route) => await route.fulfill({ json: [] }),
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );
  await expectAllSpinnersHidden(page);
});

test('Valintalaskennan tulokset välilehti on saavutettava', async ({
  page,
}) => {
  await page.locator('tbody tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('Näytetään valintalaskennan tulokset', async ({ page }) => {
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
    }),
  ).toBeVisible();

  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Tampereen yliopisto, Rakennetun ympäristön tiedekunta' +
      'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(page.getByRole('heading', { level: 3 })).toHaveText(
    'Lasketut valinnanvaiheet',
  );

  await expect(
    page.getByRole('button', { name: 'Vie kaikki taulukkolaskentaan' }),
  ).toBeVisible();

  const jono1HeadingText = 'Varsinainen valinta: Lukiokoulutus';

  await expect(
    page.getByRole('heading', {
      level: 4,
      name: jono1HeadingText,
    }),
  ).toBeVisible();

  const jono1Content = page.getByRole('region', { name: jono1HeadingText });
  const jono1HeadingRow = jono1Content.locator('thead tr');
  await checkRow(jono1HeadingRow, JONO_TABLE_HEADINGS, 'th');

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
  ).toBeVisible();

  const jono2HeadingText =
    'Harkinnanvaraisten käsittelyvaiheen valintatapajono';

  await expect(
    page.getByRole('heading', {
      level: 4,
      name: jono2HeadingText,
    }),
  ).toBeVisible();

  const jono2Content = page.getByRole('region', { name: jono2HeadingText });

  const jono2HeadingRow = jono2Content.locator('thead tr');
  await checkRow(jono2HeadingRow, JONO_TABLE_HEADINGS, 'th');

  const jono2Rows = jono2Content.locator('tbody tr');

  await expect(jono2Rows).toHaveCount(1);
  await checkRow(jono2Rows.first(), [
    '1',
    'Nukettaja Ruhtinas',
    'Lisätietoja',
    '6',
    'Hyväksyttävissä',
    '',
  ]);
});

test('Näytetään virheviesti, jos jonon poistaminen sijoittelusta epäonnistuu', async ({
  page,
}) => {
  const jono1HeadingText = 'Varsinainen valinta: Lukiokoulutus';
  const jono1Content = page.getByRole('region', { name: jono1HeadingText });

  await page.route(
    '*/**/valintaperusteet-service/resources/V2valintaperusteet/1679913592869-3133925962577840128/automaattinenSiirto?status=false',
    async (route) => {
      await route.fulfill({ status: 500, body: 'Unknown error' });
    },
  );
  await jono1Content
    .getByRole('button', { name: 'Poista jono sijoittelusta' })
    .click();

  await expect(
    page.getByText('Jonon sijoittelun tilan muuttamisessa tapahtui virhe!'),
  ).toBeVisible();
});

test.describe('Valintalaskennan muokkausmodaali', () => {
  const initSaveModal = async (page: Page) => {
    const jono2HeadingText = 'Varsinainen valinta: Lukiokoulutus';
    const jono2Content = page.getByRole('region', { name: jono2HeadingText });

    const muokkaaButton = jono2Content
      .getByRole('row', { name: 'Dacula Kreivi' })
      .getByRole('button', { name: 'Muokkaa' });

    await muokkaaButton.click();
  };

  test('Valintalaskennan tulosten muokkausmodaali on saavutettava', async ({
    page,
  }) => {
    await initSaveModal(page);
    await expectPageAccessibilityOk(page);
  });

  test('Näytetään valintalaskennan muokkausmodaali ja siinä valintalaskennan tuloksen tiedot', async ({
    page,
  }) => {
    await initSaveModal(page);

    const valintalaskentaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintalaskentaa',
    });

    await expect(valintalaskentaMuokkausModal).toBeVisible();
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Hakija', { exact: true }),
    ).toHaveText('Dacula Kreivi (101172-979F)');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Hakutoive'),
    ).toHaveText(
      `2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) ${NDASH} Tampereen yliopisto, Rakennetun ympäristön tiedekunta`,
    );
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Valintatapajono'),
    ).toHaveText('Lukiokoulutus');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Järjestyskriteeri'),
    ).toContainText('1. Lukion valintaperusteet, painotettu keskiarvo');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Pisteet'),
    ).toHaveValue('10');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Tila', { exact: true }),
    ).toContainText('Hyväksyttävissä');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Muokkauksen syy'),
    ).toHaveValue('');

    await expect(
      valintalaskentaMuokkausModal.getByRole('button', {
        name: 'Poista muokkaus',
      }),
    ).toBeDisabled();
  });

  test('Lähetetään laskennan tulosten tallennuspyyntö oikeilla arvoilla ja näytetään ilmoitus', async ({
    page,
  }) => {
    const muokkausUrl = `**/valintalaskenta-laskenta-service/resources/valintatapajono/1679913592869-3133925962577840128/${DACULA_HAKEMUS_OID}/0/jonosija`;
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        status: 200,
      });
    });

    await initSaveModal(page);
    const valintalaskentaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintalaskentaa',
    });

    await valintalaskentaMuokkausModal.getByLabel('Pisteet').fill('12,2');

    await selectOption({
      page,
      name: 'Tila',
      option: 'Hylätty',
    });

    await valintalaskentaMuokkausModal
      .getByLabel('Muokkauksen syy')
      .fill('Syy muokkaukselle');

    const saveButton = valintalaskentaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    const [request] = await Promise.all([
      page.waitForRequest(muokkausUrl),
      saveButton.click(),
    ]);

    expect(request.postDataJSON()).toEqual({
      arvo: '12.2',
      tila: TuloksenTila.HYLATTY,
      selite: 'Syy muokkaukselle',
    });

    await expectAlertTextVisible(
      page,
      'Valintalaskennan tietojen tallentaminen onnistui',
    );
  });

  test('Näytetään virheilmoitus kun valintalaskennan tuloksen tallentaminen epäonnistuu', async ({
    page,
  }) => {
    await page.route(
      `**/valintalaskenta-laskenta-service/resources/valintatapajono/1679913592869-3133925962577840128/${DACULA_HAKEMUS_OID}/0/jonosija`,
      (route) => {
        return route.fulfill({
          status: 400,
        });
      },
    );
    await initSaveModal(page);
    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintalaskentaa',
    });

    const tallennaButton = valintaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    await tallennaButton.click();

    await expectAlertTextVisible(
      page,
      'Valintalaskennan tietojen tallentaminen epäonnistui',
    );
  });
});
