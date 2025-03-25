import { test, expect, Page } from '@playwright/test';
import {
  expectAlertTextVisible,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  selectOption,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json';
import POSTI_00100 from './fixtures/posti_00100.json';
import HAKEMUKSEN_VALINTALASKENTA_TULOKSET from './fixtures/hakemuksen-valintalaskenta-tulokset.json';
import HAKEMUKSEN_SIJOITTELU_TULOKSET from './fixtures/hakemuksen-sijoittelu-tulokset.json';
import PISTETIEDOT_HAKEMUKSELLE from './fixtures/pistetiedot_hakemukselle.json';
import { configuration } from '@/lib/configuration';
import { hakemusValinnanTulosFixture } from './fixtures/hakemus-valinnan-tulos';
import {
  IlmoittautumisTila,
  SijoittelunTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  TuloksenTila,
  ValintakoeOsallistuminenTulos,
} from '@/lib/types/laskenta-types';
import { NDASH } from '@/lib/constants';

const HAKUKOHDE_OID = '1.2.246.562.20.00000000000000045105';
const NUKETTAJA_HAKEMUS_OID = '1.2.246.562.11.00000000000001796027';

const VALINNAN_TULOS_RESULT = hakemusValinnanTulosFixture({
  hakukohdeOid: HAKUKOHDE_OID,
  hakemusOid: NUKETTAJA_HAKEMUS_OID,
  valintatapajonoOid: '17093042998533736417074016063604',
  henkiloOid: '1.2.246.562.24.69259807406',
  valinnantila: SijoittelunTila.HYVAKSYTTY,
  vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  ilmoittautumistila: IlmoittautumisTila.EI_ILMOITTAUTUNUT,
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  hyvaksyttyVarasijalta: false,
  hyvaksyPeruuntunut: false,
});

const VALINNAN_TULOS_BASE = VALINNAN_TULOS_RESULT[0].valinnantulos;

test.beforeEach(async ({ page }) => {
  await page.route('**/codeelement/latest/posti_00100', (route) => {
    return route.fulfill({
      json: POSTI_00100,
    });
  });

  await page.route(configuration.hakemuksetUrl, (route) => {
    return route.fulfill({
      json: HAKENEET.filter(({ oid }) => oid === NUKETTAJA_HAKEMUS_OID),
    });
  });
  await page.route(
    configuration.hakemuksenValintalaskennanTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) =>
      route.fulfill({
        json: HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
      }),
  );
  await page.route(
    configuration.hakemuksenSijoitteluajonTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        json: HAKEMUKSEN_SIJOITTELU_TULOKSET,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        json: VALINNAN_TULOS_RESULT,
      });
    },
  );

  await page.route(
    configuration.koostetutPistetiedotHakemukselleUrl({
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) => {
      return route.fulfill({
        json: PISTETIEDOT_HAKEMUKSELLE,
      });
    },
  );
});

test('Henkilöittäin-näkymä on saavutettava', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Henkilö-haku ja navigaatio toimii', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo',
  );

  await page.route('**/lomake-editori/api/external/valinta-ui*', (route) => {
    const url = route.request().url();
    switch (true) {
      case url.includes('name=Ruhtinas'):
        return route.fulfill({
          json: HAKENEET.filter((h) => h.etunimet === 'Ruhtinas'),
        });
      case url.includes('henkilotunnus=210988-9151'):
        return route.fulfill({
          json: HAKENEET.filter((h) => h.henkilotunnus === '210988-9151'),
        });
      case url.includes('hakemusOids=1.2.246.562.11.00000000000001793706'):
        return route.fulfill({
          json: HAKENEET.filter(
            (h) => h.oid === '1.2.246.562.11.00000000000001793706',
          ),
        });
      case url.includes('henkiloOid=1.2.246.562.24.30476885816'):
        return route.fulfill({
          json: HAKENEET.filter(
            (h) => h.personOid === '1.2.246.562.24.30476885816',
          ),
        });
      default:
        return route.continue();
    }
  });

  const henkiloSearchInput = page.getByRole('textbox', {
    name: 'Hae henkilöitä',
  });

  const henkiloNavigation = page.getByRole('navigation', {
    name: 'Henkilövalitsin',
  });

  const henkiloLinks = henkiloNavigation.getByRole('link');

  await expect(henkiloNavigation).toBeHidden();

  await Promise.all([
    henkiloSearchInput.fill('210988-9151'),
    page.waitForRequest((request) =>
      request.url().includes('henkilotunnus=210988-9151'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Purukumi Puru'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('1.2.246.562.11.00000000000001793706'),
    page.waitForRequest((request) =>
      request.url().includes('hakemusOids=1.2.246.562.11.00000000000001793706'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Dacula Kreivi'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('1.2.246.562.24.30476885816'),
    page.waitForRequest((request) =>
      request.url().includes('henkiloOid=1.2.246.562.24.30476885816'),
    ),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Hui Haamu'),
  ]);

  await Promise.all([
    henkiloSearchInput.fill('Ruhtinas'),
    page.waitForRequest((request) => request.url().includes('name=Ruhtinas')),
    expect(henkiloLinks).toHaveCount(1),
    expect(henkiloLinks.first()).toContainText('Nukettaja Ruhtinas'),
  ]);

  await henkiloNavigation
    .getByRole('link', { name: 'Nukettaja Ruhtinas' })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Nukettaja Ruhtinas',
    }),
  ).toBeVisible();
});

test('Näytetään valitun henkilön tiedot ja hakutoiveet ilman valintalaskennan tai sijoittelun tuloksia', async ({
  page,
}) => {
  await page.route(
    configuration.hakemuksenValintalaskennanTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) =>
      route.fulfill({
        json: {
          hakukohteet: [],
        },
      }),
  );

  await page.route(
    configuration.hakemuksenSijoitteluajonTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        json: [],
      });
    },
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  await expect(
    page.getByRole('heading', {
      name: 'Nukettaja Ruhtinas',
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel('Hakemuksen tekninen tunniste (OID)'),
  ).toHaveText('1.2.246.562.11.00000000000001796027');
  await expect(page.getByLabel('Lähiosoite')).toHaveText(
    'Kuoppamäki 905, 00100 HELSINKI',
  );

  const accordionHeadingText =
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)';

  const accordionHeading = page.getByRole('cell', {
    name: accordionHeadingText,
  });

  await expect(
    accordionHeading.getByRole('link', {
      name: 'Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
    }),
  ).toBeVisible();

  const accordionContent = page.getByLabel(accordionHeadingText);
  await expect(
    accordionContent.getByText('Ei valintalaskennan tuloksia'),
  ).toBeHidden();
  await accordionHeading
    .getByRole('button', { name: 'Näytä hakutoiveen tiedot' })
    .click();
  await expect(
    accordionContent.getByText('Ei valintalaskennan tuloksia'),
  ).toBeVisible();
});

test('Näytetään henkilön hakutoiveet valintalaskennan ja sijoittelun tuloksilla', async ({
  page,
}) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const accordionContent = page.getByLabel(
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(accordionContent).toBeVisible();

  const jonoRows = accordionContent.getByRole('row');

  await expect(jonoRows).toHaveCount(2);

  const firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:54:55',
    '13',
    'HyväksyttävissäMuokkaa',
    'HYVÄKSYTTY',
    'KylläMuokkaa',
    'Vastaanottanut sitovasti',
    'Ei ilmoittautunut',
  ]);
  const secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Jono 1Valintalaskenta tehty: 12.11.2024 17:54:48',
    '',
    'HyväksyttävissäMuokkaa',
    '',
  ]);
});

test('Näytetään hakutoiveet valintalaskennan tuloksilla, ilman sijoittelun tuloksia', async ({
  page,
}) => {
  await page.route(
    configuration.hakemuksenSijoitteluajonTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
    }),
    (route) => {
      return route.fulfill({
        json: [],
      });
    },
  );

  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const accordionContent = page.getByLabel(
    'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  const jonoRows = accordionContent.getByRole('row');
  await expect(jonoRows).toHaveCount(2);

  const firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:54:55',
    '13',
    'HyväksyttävissäMuokkaa',
    'Ei valinnan tulosta',
  ]);
  const secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Jono 1Valintalaskenta tehty: 12.11.2024 17:54:48',
    '',
    'HyväksyttävissäMuokkaa',
    '',
  ]);
});

test.describe('Muokkausmodaalit', () => {
  const initSaveModal = async (
    page: Page,
    mode: 'valintalaskenta' | 'valinta',
  ) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    const accordionContent = page.getByLabel(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
    );

    await expect(accordionContent).toBeVisible();

    const jonoRows = accordionContent.getByRole('row');

    const tilaCell = jonoRows
      .first()
      .getByRole('cell')
      .nth(mode === 'valintalaskenta' ? 3 : 5);

    const muokkaaButton = tilaCell.getByRole('button', {
      name: 'Muokkaa',
    });

    await muokkaaButton.click();
  };

  test('Näytetään valintalaskennan tulosten muokkausmodaali', async ({
    page,
  }) => {
    await initSaveModal(page, 'valintalaskenta');

    const valintalaskentaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintalaskentaa',
    });

    await expect(valintalaskentaMuokkausModal).toBeVisible();
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Hakija', { exact: true }),
    ).toHaveText('Nukettaja Ruhtinas');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Hakutoive'),
    ).toHaveText(
      `1. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) ${NDASH} Tampereen yliopisto, Rakennetun ympäristön tiedekunta`,
    );
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Valintatapajono'),
    ).toHaveText('Jono 2');
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Järjestyskriteeri'),
    ).toContainText(
      '2. asteen peruskoulupohjainen peruskaava + Kielitaidon riittävyys - 2 aste, pk ja yo 2021',
    );
    await expect(
      valintalaskentaMuokkausModal.getByLabel('Pisteet'),
    ).toHaveValue('13');
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

  test('Valintalaskennan tallennuksessa lähetetään muokatut tiedot ja näytetään ilmoitus tallennuksen onnistumisesta', async ({
    page,
  }) => {
    const muokkausUrl = configuration.jarjestyskriteeriMuokkausUrl({
      hakemusOid: NUKETTAJA_HAKEMUS_OID,
      valintatapajonoOid: '17093042998533736417074016063604',
      jarjestyskriteeriPrioriteetti: 0,
    });
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        status: 200,
      });
    });

    await initSaveModal(page, 'valintalaskenta');
    const valintalaskentaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintalaskentaa',
    });

    await valintalaskentaMuokkausModal.getByLabel('Pisteet').fill('12');

    await selectOption(page, 'Tila', 'Hylätty');

    await valintalaskentaMuokkausModal
      .getByLabel('Muokkauksen syy')
      .fill('Syy muokkaukselle');

    const saveButton = valintalaskentaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    const [request] = await Promise.all([
      page.waitForRequest((request) => request.url() === muokkausUrl),
      saveButton.click(),
    ]);

    expect(request.postDataJSON()).toEqual({
      arvo: '12',
      tila: TuloksenTila.HYLATTY,
      selite: 'Syy muokkaukselle',
    });

    await expectAlertTextVisible(
      page,
      'Valintalaskennan tietojen tallentaminen onnistui',
    );
  });

  test('Näytetään ilmoitus valintalaskennan tallennusvirheestä', async ({
    page,
  }) => {
    await page.route(
      configuration.jarjestyskriteeriMuokkausUrl({
        hakemusOid: NUKETTAJA_HAKEMUS_OID,
        valintatapajonoOid: '17093042998533736417074016063604',
        jarjestyskriteeriPrioriteetti: 0,
      }),
      (route) => {
        return route.fulfill({
          status: 400,
        });
      },
    );
    await initSaveModal(page, 'valintalaskenta');
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

  test('Näytetään valinnan tietojen muokkausmodaali ja siinä valinnan tiedot', async ({
    page,
  }) => {
    await initSaveModal(page, 'valinta');

    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    await expect(valintaMuokkausModal).toBeVisible();

    await expect(
      valintaMuokkausModal.getByLabel('Hakija', { exact: true }),
    ).toHaveText('Nukettaja Ruhtinas');

    await expect(valintaMuokkausModal.getByLabel('Hakutoive')).toHaveText(
      `1. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) ${NDASH} Tampereen yliopisto, Rakennetun ympäristön tiedekunta`,
    );

    const julkaistavissaCheckbox = valintaMuokkausModal.getByRole('checkbox', {
      name: 'Julkaistavissa',
    });

    await expect(julkaistavissaCheckbox).toBeDisabled();
    await expect(julkaistavissaCheckbox).toBeChecked();

    await expect(
      valintaMuokkausModal.getByLabel('Vastaanoton tila'),
    ).toContainText('Vastaanottanut sitovasti');
    await expect(
      valintaMuokkausModal.getByLabel('Ilmoittautumisen tila'),
    ).toContainText('Ei ilmoittautunut');
  });

  test('Valinnan tallennus lähettää muuttuneet arvot kun muokataan tiloja', async ({
    page,
  }) => {
    const muokkausUrl = configuration.valinnanTulosMuokkausUrl({
      valintatapajonoOid: '17093042998533736417074016063604',
    });
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        json: [],
      });
    });
    await initSaveModal(page, 'valinta');

    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    await selectOption(page, 'Vastaanoton tila', 'Ehdollisesti vastaanottanut');
    await selectOption(page, 'Ilmoittautumisen tila', 'Läsnä (koko lukuvuosi)');

    const saveButton = valintaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    const [request1] = await Promise.all([
      page.waitForRequest(muokkausUrl),
      saveButton.click(),
    ]);

    const postJSON = request1.postDataJSON();

    expect(postJSON[0]).toMatchObject({
      ...VALINNAN_TULOS_BASE,
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
      ilmoittautumistila: IlmoittautumisTila.LASNA_KOKO_LUKUVUOSI,
      julkaistavissa: true,
    });

    await expectAlertTextVisible(
      page,
      'Valinnan tietojen tallentaminen onnistui',
    );
  });

  test('Valinnan tallennus lähettää muuttuneet arvot, kun julkaistu=false', async ({
    page,
  }) => {
    const muokkausUrl = configuration.valinnanTulosMuokkausUrl({
      valintatapajonoOid: '17093042998533736417074016063604',
    });
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        json: [],
      });
    });
    await initSaveModal(page, 'valinta');

    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    await selectOption(page, 'Vastaanoton tila', 'Kesken');

    await valintaMuokkausModal
      .getByRole('checkbox', { name: 'Julkaistavissa' })
      .uncheck();

    const saveButton = valintaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    const [request] = await Promise.all([
      page.waitForRequest(muokkausUrl),
      saveButton.click(),
    ]);

    const postData = request.postDataJSON();

    expect(postData[0]).toMatchObject({
      ...VALINNAN_TULOS_BASE,
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: IlmoittautumisTila.EI_TEHTY,
      julkaistavissa: false,
    });

    await expectAlertTextVisible(
      page,
      'Valinnan tietojen tallentaminen onnistui',
    );
  });

  test('Valinnan tietojen tallennuksen epäonnistuessa näytetään virheilmoitus', async ({
    page,
  }) => {
    await page.route(
      configuration.valinnanTulosMuokkausUrl({
        valintatapajonoOid: '17093042998533736417074016063604',
      }),
      (route) => {
        return route.fulfill({
          json: [
            {
              status: 400,
              message: 'Virhe backendista',
            },
          ],
        });
      },
    );
    await initSaveModal(page, 'valinta');
    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    const tallennaButton = valintaMuokkausModal.getByRole('button', {
      name: 'Tallenna',
    });

    await tallennaButton.click();
    await expectAlertTextVisible(
      page,
      'Valinnan tietojen tallentaminen epäonnistui\nVirhe backendista',
    );
  });
});

test.describe('Pistesyöttö', () => {
  test('Pistetyötössä näytetään oikeat arvot', async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    await expectAllSpinnersHidden(page);

    const pistesyottoHeading = page.getByRole('heading', {
      name: 'Pistesyöttö',
    });
    await expect(pistesyottoHeading).toBeVisible();

    const nakkikoe = page.getByRole('region', {
      name: 'Nakkikoe, oletko nakkisuojassa?',
    });

    await expect(nakkikoe).toBeVisible();

    const nakkiKyllaInput = nakkikoe.getByText('Kyllä');
    await expect(nakkiKyllaInput).toBeVisible();
    const nakkiOsallistuiInput = nakkikoe.getByText('Osallistui', {
      exact: true,
    });
    await expect(nakkiOsallistuiInput).toBeVisible();

    const nakkiTallennaButton = nakkikoe.getByRole('button', {
      name: 'Tallenna',
    });

    await expect(nakkiTallennaButton).toBeEnabled();

    const koksakoe = page.getByRole('region', {
      name: `Köksäkokeen arvosana 4${NDASH}10`,
    });

    await expect(koksakoe).toBeVisible();

    const koksaPisteetInput = koksakoe.getByLabel('Pisteet');
    await expect(koksaPisteetInput).toBeVisible();
    const koksaOsallistuiInput = koksakoe.getByText('Osallistui', {
      exact: true,
    });
    await expect(koksaOsallistuiInput).toBeVisible();

    const koksaTallennaButton = koksakoe.getByRole('button', {
      name: 'Tallenna',
    });
    await expect(koksaTallennaButton).toBeEnabled();
  });

  test('Pistesyötön tallennus lähettää muokatut arvot ja näyttää ilmoituksen tallennuksen onnistumisesta', async ({
    page,
  }) => {
    const pisteetSaveUrl = configuration.koostetutPistetiedotHakukohteelleUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: HAKUKOHDE_OID,
    });

    await page.route(pisteetSaveUrl, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
        });
      }
    });

    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    await expectAllSpinnersHidden(page);

    const pistesyottoHeading = page.getByRole('heading', {
      name: 'Pistesyöttö',
    });
    await expect(pistesyottoHeading).toBeVisible();

    const nakkikoe = page.getByRole('region', {
      name: 'Nakkikoe, oletko nakkisuojassa?',
    });

    await selectOption(
      page,
      'Osallistumisen tila',
      'Ei osallistunut',
      nakkikoe,
    );

    const nakkiTallennaButton = nakkikoe.getByRole('button', {
      name: 'Tallenna',
    });

    const [saveRes] = await Promise.all([
      page.waitForRequest(
        (request) =>
          request.url() === pisteetSaveUrl && request.method() === 'PUT',
      ),
      nakkiTallennaButton.click(),
    ]);

    expect(saveRes.postDataJSON()).toMatchObject([
      {
        oid: '1.2.246.562.11.00000000000001796027',
        personOid: '1.2.246.562.24.69259807406',
        firstNames: 'Ruhtinas',
        lastName: 'Nukettaja',
        additionalData: {
          'nakki-osallistuminen': ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
        },
      },
    ]);

    await expectAlertTextVisible(page, 'Tiedot tallennettu');
  });

  test('Näytetään virhe, kun pistesyötön tallennusn epäonnistuu', async ({
    page,
  }) => {
    const pisteetSaveUrl = configuration.koostetutPistetiedotHakukohteelleUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: HAKUKOHDE_OID,
    });

    await page.route(pisteetSaveUrl, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 400,
        });
      }
    });

    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    const nakkikoe = page.getByRole('region', {
      name: 'Nakkikoe, oletko nakkisuojassa?',
    });

    await selectOption(
      page,
      'Osallistumisen tila',
      'Ei osallistunut',
      nakkikoe,
    );

    const nakkiTallennaButton = nakkikoe.getByRole('button', {
      name: 'Tallenna',
    });

    await Promise.all([
      page.waitForRequest(
        (request) =>
          request.url() === pisteetSaveUrl && request.method() === 'PUT',
      ),
      nakkiTallennaButton.click(),
    ]);

    await expectAlertTextVisible(
      page,
      'Tietojen tallentamisessa tapahtui virhe.',
    );
  });
});

const startLaskenta = async (page: Page) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const valintalaskentaButton = page.getByRole('button', {
    name: 'Suorita valintalaskenta',
  });

  await expect(valintalaskentaButton).toBeVisible();
  await valintalaskentaButton.click();

  await page.getByRole('button', { name: 'Kyllä' }).click();
};

test.describe('Valintalaskenta', () => {
  test('näytetään virhe, kun valintalaskennan käynnistäminen epäonnistuu', async ({
    page,
  }) => {
    await page.route(
      '*/**/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000045102/tyyppi/HAKUKOHDE/whitelist/true**',
      async (route) => {
        await route.fulfill({ status: 500, body: 'Unknown error' });
      },
    );
    await startLaskenta(page);

    await expectAlertTextVisible(
      page,
      'Valintalaskenta epäonnistuiUnknown error',
    );
  });

  test('käynnistetään laskenta ja näytetään yhteenveto virheistä', async ({
    page,
  }) => {
    await page.route(
      '*/**/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000045102/tyyppi/HAKUKOHDE/whitelist/true**',
      async (route) => {
        const started = {
          lisatiedot: {
            luotiinkoUusiLaskenta: true,
          },
          latausUrl: '12345abs',
        };
        await route.fulfill({
          json: started,
        });
      },
    );
    await page.route(
      '*/**/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345abs',
      async (route) => {
        const seuranta = {
          tila: 'VALMIS',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 1,
          hakukohteitaKeskeytetty: 0,
        };
        await route.fulfill({
          json: seuranta,
        });
      },
    );
    await page.route(
      '*/**/resources/valintalaskentakerralla/status/12345abs/yhteenveto',
      async (route) => {
        await route.fulfill({
          json: {
            hakukohteet: [
              {
                hakukohdeOid: '1.2.246.562.20.00000000000000045105',
                tila: 'VIRHE',
                ilmoitukset: [
                  {
                    otsikko: 'Unknown Error',
                  },
                ],
              },
            ],
          },
        });
      },
    );
    await startLaskenta(page);
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
    await expect(page.getByText('Unknown Error')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeHidden();

    await page.getByRole('button', { name: 'Sulje laskennan tiedot' }).click();

    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeVisible();
  });

  test('näytetään laskennan tulokset ja ilmoitus laskennan onnistumisesta', async ({
    page,
  }) => {
    await page.route(
      '*/**/resources/valintalaskentakerralla/haku/1.2.246.562.29.00000000000000045102/tyyppi/HAKUKOHDE/whitelist/true**',
      async (route) => {
        const started = {
          lisatiedot: {
            luotiinkoUusiLaskenta: true,
          },
          latausUrl: '12345abs',
        };
        await route.fulfill({
          json: started,
        });
      },
    );
    await page.route(
      '*/**/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/12345abs',
      async (route) => {
        await route.fulfill({
          json: {
            tila: 'VALMIS',
            hakukohteitaYhteensa: 1,
            hakukohteitaValmiina: 1,
            hakukohteitaKeskeytetty: 0,
          },
        });
      },
    );
    await page.route(
      '*/**/resources/valintalaskentakerralla/status/12345abs/yhteenveto',
      async (route) => {
        await route.fulfill({
          json: {
            tila: 'VALMIS',
            hakukohteet: [
              {
                hakukohdeOid: '1.2.246.562.20.00000000000000045105',
                tila: 'VALMIS',
                ilmoitukset: [],
              },
            ],
          },
        });
      },
    );
    await startLaskenta(page);
    await expect(
      page.getByText(
        'Laskenta on päättynyt. Hakukohteita valmiina 1/1. Suorittamattomia hakukohteita 0.',
      ),
    ).toBeVisible();

    await expectAlertTextVisible(page, 'Laskenta suoritettu onnistuneesti');

    const suljeTiedotButton = page.getByRole('button', {
      name: 'Sulje laskennan tiedot',
    });
    await expect(suljeTiedotButton).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Näytä suorittamattomat hakukohteet' }),
    ).toBeHidden();

    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeHidden();

    await suljeTiedotButton.click();

    await expect(
      page.getByRole('button', { name: 'Suorita valintalaskenta' }),
    ).toBeVisible();
  });
});
