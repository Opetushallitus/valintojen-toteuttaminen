import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json' with { type: 'json' };
import {
  HISTORIAN_VALINTALASKENNAN_TULOKSET,
  HISTORIA_HAKEMUSOID,
  HISTORIA_HAKUKOHDEOID,
  HISTORIA_HAKUOID,
  HISTORIA_VALINNANVAIHEOID,
  HISTORIA_VALINTATAPAJONOOID,
  JARJESTYSKRITEERIT_RESPONSE,
  JONOSIJAHISTORIA_RESPONSE,
  LASKENTAKAAVOJEN_NIMET,
  TYHJA_JONOSIJAHISTORIA_RESPONSE,
} from './fixtures/valintalaskentahistoria';
import { NDASH } from '@/lib/constants';

const HISTORIA_URL = `/valintojen-toteuttaminen/valintatapajono/${HISTORIA_VALINTATAPAJONOOID}/hakemus/${HISTORIA_HAKEMUSOID}/valintalaskentahistoria`;

const mockJonosijahistoria = (page: Page, json: unknown) =>
  page.route(
    `**/valintalaskenta-laskenta-service/resources/jonosijahistoria/${HISTORIA_VALINTATAPAJONOOID}/${HISTORIA_HAKEMUSOID}`,
    (route) => route.fulfill({ json }),
  );

test.beforeEach(async ({ page }) => {
  // Oletuksena mock-palvelin palauttaa kaikki hakemukset, joten rajataan vastaus testin hakemukseen
  await page.route(
    (url) => url.pathname.endsWith('/lomake-editori/api/external/valinta-ui'),
    (route) =>
      route.fulfill({
        json: HAKENEET.filter(({ oid }) => oid === HISTORIA_HAKEMUSOID),
      }),
  );
  await page.route(
    `**/valintalaskenta-laskenta-service/resources/hakemus/${HISTORIA_HAKUOID}/${HISTORIA_HAKEMUSOID}`,
    (route) => route.fulfill({ json: HISTORIAN_VALINTALASKENNAN_TULOKSET }),
  );
  await page.route(
    `**/valintaperusteet-service/resources/valintatapajono/${HISTORIA_VALINTATAPAJONOOID}/jarjestyskriteeri`,
    (route) => route.fulfill({ json: JARJESTYSKRITEERIT_RESPONSE }),
  );
  await page.route(
    (url) =>
      /\/valintaperusteet-service\/resources\/laskentakaava\/\d+$/.test(
        url.pathname,
      ),
    (route) => {
      const id = Number(
        new URL(route.request().url()).pathname.split('/').pop(),
      );
      return route.fulfill({ json: { id, nimi: LASKENTAKAAVOJEN_NIMET[id] } });
    },
  );
  await mockJonosijahistoria(page, JONOSIJAHISTORIA_RESPONSE);
});

test('Valintalaskentahistoria-näkymä on saavutettava', async ({ page }) => {
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Näyttää hakemuksen ja haun tiedot', async ({ page }) => {
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  const otsikko = page.getByRole('heading', { level: 2 });
  await expect(otsikko).toContainText(
    `Laskenta hakemukselle ${HISTORIA_HAKEMUSOID} (Nukettaja Ruhtinas)`,
  );
  await expect(
    otsikko.getByRole('link', { name: HISTORIA_HAKEMUSOID }),
  ).toHaveAttribute(
    'href',
    new RegExp(
      `lomake-editori/applications/search\\?term=${HISTORIA_HAKEMUSOID}$`,
    ),
  );

  await expect(
    page.getByRole('link', {
      name: 'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
    }),
  ).toHaveAttribute('href', new RegExp(`kouta/haku/${HISTORIA_HAKUOID}$`));
  await expect(page.getByLabel('Haun tunniste')).toHaveText(HISTORIA_HAKUOID);

  // Hakukohde on se, jonka valinnanvaiheeseen valintatapajono kuuluu
  await expect(
    page.getByRole('link', {
      name: 'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
    }),
  ).toHaveAttribute(
    'href',
    new RegExp(`kouta/hakukohde/${HISTORIA_HAKUKOHDEOID}$`),
  );
  await expect(page.getByLabel('Hakukohteen tunniste')).toHaveText(
    HISTORIA_HAKUKOHDEOID,
  );
});

test('Näyttää ilmoituksen, jos hakemusta ei löydy', async ({ page }) => {
  await page.route(
    (url) => url.pathname.endsWith('/lomake-editori/api/external/valinta-ui'),
    (route) => route.fulfill({ json: [] }),
  );
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  await expect(
    page.getByText(`Hakemusta ei löytynyt tunnisteella ${HISTORIA_HAKEMUSOID}`),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
});

test('Näyttää ilmoituksen, jos valintalaskentahistoriaa ei löydy', async ({
  page,
}) => {
  await mockJonosijahistoria(page, []);
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  // Hakemuksen ja haun tiedot näytetään, vaikka historiaa ei ole
  await expect(page.getByRole('heading', { level: 2 })).toContainText(
    `Laskenta hakemukselle ${HISTORIA_HAKEMUSOID}`,
  );
  await expect(page.getByLabel('Haun tunniste')).toHaveText(HISTORIA_HAKUOID);
  await expect(
    page.getByText('Valintalaskentahistoriaa ei löytynyt'),
  ).toBeVisible();
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Näytä arvot' })).toHaveCount(
    0,
  );
});

test('Avaimet ja arvot avataan ja suljetaan painikkeilla', async ({ page }) => {
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  const avaimetButton = page.getByRole('button', { name: 'Näytä avaimet' });
  await expect(avaimetButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('table')).toHaveCount(0);

  // Avaimet kerätään kaikista järjestyskriteereistä ja järjestetään aakkosjärjestykseen
  await avaimetButton.click();
  const piilotaAvaimetButton = page.getByRole('button', {
    name: 'Piilota avaimet',
  });
  await expect(piilotaAvaimetButton).toHaveAttribute('aria-expanded', 'true');
  const avaimetTable = page.getByRole('table');
  await checkRow(avaimetTable.locator('thead tr'), ['Avain', 'Arvo'], 'th');
  const avainRows = avaimetTable.locator('tbody tr');
  await expect(avainRows).toHaveCount(3);
  await checkRow(avainRows.nth(0), ['asiointikieli', 'fi']);
  await checkRow(avainRows.nth(1), ['kieli', 'FI']);
  await checkRow(avainRows.nth(2), ['pohjakoulutus', '1']);

  await piilotaAvaimetButton.click();
  await expect(page.getByRole('table')).toHaveCount(0);

  // Arvot ovat funktiopuun nimettyjä arvoja kaikista järjestyskriteereistä
  await page.getByRole('button', { name: 'Näytä arvot' }).click();
  const arvotTable = page.getByRole('table');
  // ja järjestetään nimen mukaan
  await checkRow(
    arvotTable.locator('thead tr'),
    ['Nimi', 'Tyyppi', 'Järjestyskriteerit', 'Tulos'],
    'th',
  );
  const arvoRows = arvotTable.locator('tbody tr');
  await expect(arvoRows).toHaveCount(3);
  // Molemmissa järjestyskriteereissä täysin samana esiintyvä arvo näytetään yhdellä rivillä
  await checkRow(arvoRows.nth(0), [
    'Pohjakoulutus kunnossa',
    'Nimetty totuusarvo',
    '1, 2',
    'true',
  ]);
  // Samannimiset arvot, joiden avaimet eroavat, näytetään omilla riveillään
  await checkRow(arvoRows.nth(1), [
    'Yhteispisteet',
    'Nimetty lukuarvo',
    '1',
    '8',
  ]);
  await checkRow(arvoRows.nth(2), [
    async (cell) => {
      await expect(cell).toHaveText('Yhteispisteet');
      // Muut avaimet näytetään lisätietopainikkeen takana
      await cell.getByRole('button', { name: 'Lisätietoja' }).click();
      await expect(page.getByRole('tooltip')).toContainText(
        'valintaperuste: lisapisteet',
      );
      await page
        .getByRole('tooltip')
        .getByRole('button', { name: 'Sulje' })
        .click();
      await expect(page.getByRole('tooltip')).toBeHidden();
    },
    'Nimetty lukuarvo',
    '2',
    '8',
  ]);
  // Avaimettomalla arvolla ei ole lisätietopainiketta
  await expect(
    arvoRows.nth(1).getByRole('button', { name: 'Lisätietoja' }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Piilota arvot' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('Näyttää tyhjille avaimille ja arvoille tekstin', async ({ page }) => {
  await mockJonosijahistoria(page, TYHJA_JONOSIJAHISTORIA_RESPONSE);
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  await page.getByRole('button', { name: 'Näytä avaimet' }).click();
  await expect(page.getByText('Ei avaimia')).toBeVisible();
  await page.getByRole('button', { name: 'Näytä arvot' }).click();
  await expect(page.getByText('Ei nimettyjä arvoja')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('Järjestyskriteerien välilehdet näyttävät järjestyskriteerin tiedot', async ({
  page,
}) => {
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  const tabs = page
    .getByRole('tablist', { name: 'Järjestyskriteerit' })
    .getByRole('tab');
  await expect(tabs).toHaveText([
    '1. järjestyskriteeri',
    '2. järjestyskriteeri',
  ]);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');

  const tabpanel = page.getByRole('tabpanel');

  await expect(tabpanel.getByLabel('Tila')).toHaveText('Hyväksyttävissä');
  await expect(tabpanel.getByLabel('Tulos')).toHaveText('12');
  await expect(
    tabpanel.getByRole('link', { name: 'Valintaperusteen mallinnus' }),
  ).toHaveAttribute(
    'href',
    new RegExp(
      `valintaperusteet-ui/app/index.html#/hakukohde/${HISTORIA_HAKUKOHDEOID}/valinnanvaihe/${HISTORIA_VALINNANVAIHEOID}/valintatapajono/${HISTORIA_VALINTATAPAJONOOID}/jarjestyskriteeri/jk-1$`,
    ),
  );
  // Suora linkki järjestyskriteeriin ei tarvitse selitystä
  await expect(
    tabpanel.getByRole('button', {
      name: 'Miksi linkki vie valintatapajonoon?',
    }),
  ).toHaveCount(0);

  // 2. välilehden tuloksen prioriteetti on 2, koska välissä on ei-aktiivinen järjestyskriteeri
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  // Tila näytetään järjestyskriteerin tulokseen tallennetusta tilasta, ei historiasta
  await expect(tabpanel.getByLabel('Tila')).toHaveText(
    `Hylätty ${NDASH} Hylätty edellisessä valinnanvaiheessa`,
  );
  await expect(tabpanel.getByLabel('Tulos')).toHaveText(NDASH);
  await expect(
    tabpanel.getByRole('link', { name: 'Valintaperusteen mallinnus' }),
  ).toHaveAttribute('href', /\/jarjestyskriteeri\/jk-2$/);
});

test('Linkittää valintatapajonoon, jos järjestyskriteerit ovat muuttuneet laskennan jälkeen', async ({
  page,
}) => {
  // Jonon alkuun on lisätty uusi järjestyskriteeri, joten prioriteetit eivät enää vastaa tuloksia
  await page.route(
    `**/valintaperusteet-service/resources/valintatapajono/${HISTORIA_VALINTATAPAJONOOID}/jarjestyskriteeri`,
    (route) =>
      route.fulfill({
        json: [
          { oid: 'jk-uusi', laskentakaavaId: 103, aktiivinen: true },
          ...JARJESTYSKRITEERIT_RESPONSE,
        ],
      }),
  );
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  const tabs = page
    .getByRole('tablist', { name: 'Järjestyskriteerit' })
    .getByRole('tab');
  const tabpanel = page.getByRole('tabpanel');
  const jononLinkki = new RegExp(
    `valintaperusteet-ui/app/index.html#/hakukohde/${HISTORIA_HAKUKOHDEOID}/valinnanvaihe/${HISTORIA_VALINNANVAIHEOID}/valintatapajono/${HISTORIA_VALINTATAPAJONOOID}$`,
  );

  const linkki = tabpanel.getByRole('link', {
    name: 'Valintaperusteen mallinnus',
  });
  const lisatietoja = tabpanel.getByRole('button', {
    name: 'Miksi linkki vie valintatapajonoon?',
  });

  // Prioriteetin 0 järjestyskriteerin nimi ei vastaa tulosta
  await expect(linkki).toHaveAttribute('href', jononLinkki);
  // Lisätietopainikkeesta näytetään syy, miksi linkki vie valintatapajonoon
  await lisatietoja.click();
  await expect(page.getByRole('tooltip')).toContainText(
    'Järjestyskriteerejä on muutettu valintalaskennan jälkeen',
  );
  await page.getByRole('button', { name: 'Sulje', exact: true }).click();

  // Prioriteetin 2 järjestyskriteeri ei ole aktiivinen
  await tabs.nth(1).click();
  await expect(linkki).toHaveAttribute('href', jononLinkki);
  await expect(lisatietoja).toBeVisible();
});

test('Näyttää järjestyskriteerin funktiopuun', async ({ page }) => {
  await page.goto(HISTORIA_URL);
  await expectAllSpinnersHidden(page);

  const tabpanel = page.getByRole('tabpanel');
  const puu = tabpanel.getByRole('list').first();

  // Juurisolmua ("Laskenta hakemukselle") ei näytetä, puu alkaa ylimmästä funktiosta
  await expect(puu).not.toContainText('Laskenta hakemukselle');
  await expect(puu.getByText('Summa', { exact: true })).toBeVisible();
  await expect(puu).toContainText('Summa (Tulos: 12)');

  // Nimetyn arvon otsikkona on sen nimi ja tyyppinä funktio
  await expect(puu).toContainText(
    `Yhteispisteet ${NDASH} Nimetty lukuarvo (Tulos: 8)`,
  );
  await expect(puu).toContainText(
    `Pohjakoulutus kunnossa ${NDASH} Nimetty totuusarvo (Tulos: true)`,
  );

  // Yksi avain näytetään suoraan rivillä, puuttuva arvo tekstinä
  await expect(puu).toContainText(
    `Hae lukuarvo (Tulos: 8) ${NDASH} oletusarvo: (ei arvoa)`,
  );

  // Useampi avain näytetään lisätietopainikkeen takana
  const monenAvaimenRivi = puu
    .getByRole('listitem')
    .filter({ hasText: 'Hae lukuarvo (Tulos: 0)' });
  await monenAvaimenRivi.getByRole('button', { name: 'Lisätietoja' }).click();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toContainText('valintaperuste: lisapisteet');
  await expect(tooltip).toContainText('oletusarvo: 0');
});
