import { test, expect, Page } from '@playwright/test';
import {
  expectAlertTextVisible,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  mockOneOrganizationHierarchy,
  mockValintalaskentaRun,
  selectOption,
  waitForMethodRequest,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json';
import POSTI_00100 from './fixtures/posti_00100.json';
import HAKEMUKSEN_VALINTALASKENTA_TULOKSET from './fixtures/hakemuksen-valintalaskenta-tulokset.json';
import HAKEMUKSEN_SIJOITTELU_TULOKSET from './fixtures/hakemuksen-sijoittelu-tulokset.json';
import PISTETIEDOT_HAKEMUKSELLE from './fixtures/pistetiedot_hakemukselle.json';
import { hakemusValinnanTulosFixture } from './fixtures/hakemus-valinnan-tulos';
import {
  IlmoittautumisTila,
  ValinnanTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { TuloksenTila } from '@/lib/types/laskenta-types';
import { NDASH } from '@/lib/constants';

const HAKUKOHDE_OID = '1.2.246.562.20.00000000000000045105';
const NUKETTAJA_HAKEMUS_OID = '1.2.246.562.11.00000000000001796027';

const VALINNAN_TULOS_RESULT = hakemusValinnanTulosFixture([
  {
    hakukohdeOid: HAKUKOHDE_OID,
    hakemusOid: NUKETTAJA_HAKEMUS_OID,
    valintatapajonoOid: '17093042998533736417074016063604',
    henkiloOid: '1.2.246.562.24.69259807406',
    valinnantila: ValinnanTila.HYVAKSYTTY,
    vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
    ilmoittautumistila: IlmoittautumisTila.EI_ILMOITTAUTUNUT,
    julkaistavissa: true,
    ehdollisestiHyvaksyttavissa: false,
    hyvaksyttyVarasijalta: false,
    hyvaksyPeruuntunut: false,
  },
  {
    hakukohdeOid: '1.2.246.562.20.00000000000000045103',
    hakemusOid: NUKETTAJA_HAKEMUS_OID,
    valintatapajonoOid: '17093042998533736417074016063604',
    henkiloOid: '1.2.246.562.24.69259807406',
    valinnantila: ValinnanTila.HYLATTY,
    vastaanottotila: VastaanottoTila.PERUUTETTU,
    ilmoittautumistila: IlmoittautumisTila.EI_ILMOITTAUTUNUT,
    julkaistavissa: true,
    ehdollisestiHyvaksyttavissa: false,
    hyvaksyttyVarasijalta: false,
    hyvaksyPeruuntunut: false,
  },
]);

const VALINNAN_TULOS_BASE = VALINNAN_TULOS_RESULT[0]?.valinnantulos;

test.beforeEach(async ({ page }) => {
  await page.route('**/codeelement/latest/posti_00100', (route) => {
    return route.fulfill({
      json: POSTI_00100,
    });
  });

  await page.route('**/lomake-editori/api/external/valinta-ui', (route) => {
    return route.fulfill({
      json: HAKENEET.filter(({ oid }) => oid === NUKETTAJA_HAKEMUS_OID),
    });
  });
  await page.route(
    `**/valintalaskenta-laskenta-service/resources/hakemus/1.2.246.562.29.00000000000000045102/${NUKETTAJA_HAKEMUS_OID}`,
    (route) =>
      route.fulfill({
        json: HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
      }),
  );
  await page.route(
    `**/valinta-tulos-service/auth/sijoittelu/1.2.246.562.29.00000000000000045102/sijoitteluajo/latest/hakemus/${NUKETTAJA_HAKEMUS_OID}`,
    (route) => {
      return route.fulfill({
        json: HAKEMUKSEN_SIJOITTELU_TULOKSET,
      });
    },
  );

  await page.route(
    `**/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid=${NUKETTAJA_HAKEMUS_OID}`,
    (route) => {
      return route.fulfill({
        json: VALINNAN_TULOS_RESULT,
      });
    },
  );

  await page.route(
    `**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/${NUKETTAJA_HAKEMUS_OID}`,
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
    `**/valintalaskenta-laskenta-service/resources/hakemus/1.2.246.562.29.00000000000000045102/${NUKETTAJA_HAKEMUS_OID}`,
    (route) =>
      route.fulfill({
        json: {
          hakukohteet: [],
        },
      }),
  );

  await page.route(
    `**/valinta-tulos-service/auth/sijoittelu/1.2.246.562.29.00000000000000045102/sijoitteluajo/latest/hakemus/${NUKETTAJA_HAKEMUS_OID}`,
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    `**/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid=${NUKETTAJA_HAKEMUS_OID}`,
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

  await expect(
    page.getByRole('table').getByRole('link', {
      name: 'Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
    }),
  ).toBeVisible();

  const accordionHeading = page
    .getByRole('button', { name: 'Näytä hakutoiveen tiedot' })
    .nth(1);

  const accordionContent = page.getByLabel(accordionHeadingText);
  await expect(
    accordionContent.getByText('Ei valintalaskennan tuloksia'),
  ).toBeHidden();
  await accordionHeading.click();
  await expect(
    accordionContent.getByText('Ei valintalaskennan tuloksia'),
  ).toBeVisible();
});

test('Käyttäjä näkee muut hakutoiveet jos yksi hakukohteista on käyttäjän oikeuksissa', async ({
  page,
}) => {
  await mockOneOrganizationHierarchy(page, {
    oid: '1.2.246.562.10.61176371294',
  });

  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      const user = {
        organisaatiot: [
          {
            organisaatioOid: '1.2.246.562.10.61176371294',
            kayttooikeudet: [
              { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'CRUD' },
            ],
          },
        ],
      };
      await route.fulfill({ json: user });
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

  const accordionContentEnabled = page.getByLabel(
    '1. Finnish MAOL competition route, Natural Sciences and Mathematics, Science and Engineering, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(accordionContentEnabled).toBeVisible();

  let jonoRows = accordionContentEnabled.getByRole('row');

  await expect(jonoRows).toHaveCount(2);

  let firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:53:49',
    '15',
    'HyväksyttävissäMuokkaa',
    'Ei valinnan tulosta',
    '',
  ]);
  let secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Harkinnanvaraisten käsittelyvaiheen valintatapajonoValintalaskenta tehty: 12.11.2024 17:53:39',
    '',
    'HyväksyttävissäMuokkaa',
    'Ei valinnan tulosta',
    '',
  ]);

  const accordionContentDisabled = page.getByLabel(
    '2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(accordionContentDisabled).toBeVisible();

  jonoRows = accordionContentDisabled.getByRole('row');

  await expect(jonoRows).toHaveCount(2);

  firstRowTextContents = await jonoRows
    .nth(0)
    .getByRole('cell')
    .allTextContents();
  expect(firstRowTextContents).toEqual([
    '',
    'Jono 2Valintalaskenta tehty: 12.11.2024 17:54:55',
    '13,3',
    'Hyväksyttävissä',
    'HYVÄKSYTTY',
    'Kyllä',
    'Vastaanottanut sitovasti',
    'Ei ilmoittautunut',
  ]);
  secondRowTextContents = await jonoRows
    .nth(1)
    .getByRole('cell')
    .allTextContents();
  expect(secondRowTextContents).toEqual([
    '',
    'Jono 1Valintalaskenta tehty: 12.11.2024 17:54:48',
    '',
    'Hyväksyttävissä',
    'Ei valinnan tulosta',
    '',
  ]);

  await expect(
    page
      .getByTestId(
        'henkilo-pistesyotto-hakukohde-1.2.246.562.20.00000000000000045103',
      )
      .getByRole('link', { name: 'Tampereen yliopisto, Tekniikan ja' }),
  ).toBeVisible();
  // Linkkiä ei näytetä hakijan hakutoiveella jolle käyttäjällä ei ole oikeuksia,
  await expect(
    page
      .getByTestId(
        'henkilo-pistesyotto-hakukohde-1.2.246.562.20.00000000000000045103',
      )
      .getByRole('link', { name: 'Tampereen yliopisto, Rakennetun' }),
  ).toBeHidden();
});

test('Näytetään henkilön hakutoiveet valintalaskennan ja sijoittelun tuloksilla', async ({
  page,
}) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );

  const accordionContent = page.getByLabel(
    '2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
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
    '13,3',
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
    'Ei valinnan tulosta',
    '',
  ]);
});

test('Näytetään hakutoiveet valintalaskennan tuloksilla, ilman sijoittelun tuloksia', async ({
  page,
}) => {
  await page.route(
    `**/valinta-tulos-service/auth/sijoittelu/1.2.246.562.29.00000000000000045102/sijoitteluajo/latest/hakemus/${NUKETTAJA_HAKEMUS_OID}`,
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    `**/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid=${NUKETTAJA_HAKEMUS_OID}`,
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
    '13,3',
    'HyväksyttävissäMuokkaa',
    'Ei valinnan tulosta',
    '',
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
    'Ei valinnan tulosta',
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
      '2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
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
      `2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) ${NDASH} Tampereen yliopisto, Rakennetun ympäristön tiedekunta`,
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
    ).toHaveValue('13,3');
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
    const muokkausUrl = `/valintalaskenta-laskenta-service/resources/valintatapajono/17093042998533736417074016063604/${NUKETTAJA_HAKEMUS_OID}/jonosija/jarjestyskriteerit`;
    await page.route('**' + muokkausUrl, (route) => {
      return route.fulfill({
        status: 200,
      });
    });

    await initSaveModal(page, 'valintalaskenta');
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
      page.waitForRequest((req) => req.url().includes(muokkausUrl)),
      saveButton.click(),
    ]);

    expect(request.postDataJSON()).toEqual([
      {
        arvo: '12.2',
        tila: TuloksenTila.HYLATTY,
        selite: 'Syy muokkaukselle',
        jarjestyskriteeriPrioriteetti: 0,
      },
    ]);

    await expectAlertTextVisible(
      page,
      'Valintalaskennan tietojen tallentaminen onnistui',
    );
  });

  test('Näytetään ilmoitus valintalaskennan tallennusvirheestä', async ({
    page,
  }) => {
    await page.route(
      `**/valintalaskenta-laskenta-service/resources/valintatapajono/17093042998533736417074016063604/${NUKETTAJA_HAKEMUS_OID}/jonosija/jarjestyskriteerit`,
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

    await valintaMuokkausModal.getByLabel('Pisteet').fill('-12,2');

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
      `2. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) ${NDASH} Tampereen yliopisto, Rakennetun ympäristön tiedekunta`,
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
    const muokkausUrl =
      '**/valinta-tulos-service/auth/valinnan-tulos/17093042998533736417074016063604';
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        json: [],
      });
    });
    await initSaveModal(page, 'valinta');

    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    await selectOption({
      page,
      name: 'Vastaanoton tila',
      option: 'Ehdollisesti vastaanottanut',
    });
    await selectOption({
      page,
      name: 'Ilmoittautumisen tila',
      option: 'Läsnä (koko lukuvuosi)',
    });

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
    const muokkausUrl =
      '**/valinta-tulos-service/auth/valinnan-tulos/17093042998533736417074016063604';
    await page.route(muokkausUrl, (route) => {
      return route.fulfill({
        json: [],
      });
    });
    await initSaveModal(page, 'valinta');

    const valintaMuokkausModal = page.getByRole('dialog', {
      name: 'Muokkaa valintaa',
    });

    await selectOption({
      page,
      name: 'Vastaanoton tila',
      option: 'Kesken',
    });

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
      '**/valinta-tulos-service/auth/valinnan-tulos/17093042998533736417074016063604',
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
  test('Pistesyötössä näytetään oikeat arvot', async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    await expectAllSpinnersHidden(page);

    const pistesyottoHeading = page.getByRole('heading', {
      name: 'Pistesyöttö',
    });
    await expect(pistesyottoHeading).toBeVisible();

    const pisteSyottoHakukohde = page.getByTestId(
      `henkilo-pistesyotto-hakukohde-${HAKUKOHDE_OID}`,
    );
    const nakkikoe = pisteSyottoHakukohde.getByLabel(
      'Nakkikoe, oletko nakkisuojassa?',
    );

    await expect(nakkikoe).toBeVisible();

    const nakkiKyllaInput = nakkikoe.getByText('Kyllä');
    await expect(nakkiKyllaInput).toBeVisible();
    const nakkiOsallistuiInput = nakkikoe.getByText('Osallistui', {
      exact: true,
    });
    await expect(nakkiOsallistuiInput).toBeVisible();

    const koksakoe = pisteSyottoHakukohde.getByLabel('Köksäkokeen arvosana');

    await expect(koksakoe).toBeVisible();

    const koksaPisteetInput = koksakoe.getByLabel('Pisteet');
    await expect(koksaPisteetInput).toBeVisible();
    await expect(koksaPisteetInput).toHaveValue('8,8');
    const koksaOsallistuiInput = koksakoe.getByText('Osallistui', {
      exact: true,
    });
    await expect(koksaOsallistuiInput).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Tallenna',
      }),
    ).toBeEnabled();
  });

  test('Pistesyötön tallennus lähettää muokatut ja muokkaamattomat arvot ja näyttää ilmoituksen tallennuksen onnistumisesta', async ({
    page,
  }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    await expectAllSpinnersHidden(page);

    const pisteetSaveUrl = `/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/1.2.246.562.11.00000000000001796027`;

    await page.route('**' + pisteetSaveUrl, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
        });
      }

      return route.fulfill({
        json: PISTETIEDOT_HAKEMUKSELLE,
      });
    });

    const pistesyottoHeading = page.getByRole('heading', {
      name: 'Pistesyöttö',
    });
    await expect(pistesyottoHeading).toBeVisible();

    const pisteSyottoHakukohde = page.getByTestId(
      `henkilo-pistesyotto-hakukohde-${HAKUKOHDE_OID}`,
    );
    const nakkikoe = pisteSyottoHakukohde.getByLabel(
      'Nakkikoe, oletko nakkisuojassa?',
    );

    await selectOption({
      page,
      locator: nakkikoe,
      name: 'Osallistumisen tila',
      option: 'Ei osallistunut',
    });

    const tallennaButton = page.getByRole('button', {
      name: 'Tallenna',
    });

    const [saveRes] = await Promise.all([
      waitForMethodRequest(page, 'PUT', (url) => url.includes(pisteetSaveUrl)),
      tallennaButton.click(),
    ]);

    expect(saveRes.postDataJSON()).toMatchObject({
      oid: '1.2.246.562.11.00000000000001796027',
      personOid: '1.2.246.562.24.69259807406',
      firstNames: 'Ruhtinas',
      lastName: 'Nukettaja',
      additionalData: {
        koksa: '8.8',
        'koksa-osallistuminen': 'OSALLISTUI',
        nakki: '',
        'nakki-osallistuminen': 'EI_OSALLISTUNUT',
      },
    });

    await expectAlertTextVisible(page, 'Tiedot tallennettu');
  });

  test('Näytetään virhe, kun pistesyötön tallennus epäonnistuu', async ({
    page,
  }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
    );

    await expectAllSpinnersHidden(page);

    const pisteetSaveUrl = `/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/1.2.246.562.11.00000000000001796027`;

    await page.route('**' + pisteetSaveUrl, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 400,
        });
      }

      return route.fulfill({
        json: PISTETIEDOT_HAKEMUKSELLE,
      });
    });

    const pisteSyottoHakukohde = page.getByTestId(
      `henkilo-pistesyotto-hakukohde-${HAKUKOHDE_OID}`,
    );
    const nakkikoe = pisteSyottoHakukohde.getByLabel(
      'Nakkikoe, oletko nakkisuojassa?',
    );

    await selectOption({
      page,
      locator: nakkikoe,
      name: 'Osallistumisen tila',
      option: 'Ei osallistunut',
    });

    const tallennaButton = page.getByRole('button', {
      name: 'Tallenna',
    });

    await Promise.all([
      waitForMethodRequest(page, 'PUT', (url) => url.includes(pisteetSaveUrl)),
      tallennaButton.click(),
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
  test('valintalaskennan käynnistäminen on estetty jos käyttäjällä on vain lukuoikeudet', async ({
    page,
  }) => {
    await page.route(
      '*/**/kayttooikeus-service/henkilo/current/omattiedot',
      async (route) => {
        const user = {
          organisaatiot: [
            {
              organisaatioOid: '1.2.246.562.10.61176371294',
              kayttooikeudet: [
                { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'READ' },
              ],
            },
          ],
        };
        await route.fulfill({ json: user });
      },
    );

    const valintalaskentaButton = page.getByRole('button', {
      name: 'Suorita valintalaskenta',
    });

    await expect(valintalaskentaButton).toBeHidden();
  });

  test('näytetään virhe, kun valintalaskennan käynnistäminen epäonnistuu', async ({
    page,
  }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKUKOHDE',
      startResponse: { status: 500, body: 'Unknown error' },
    });

    await startLaskenta(page);

    await expectAlertTextVisible(
      page,
      'Valintalaskenta epäonnistuiUnknown error',
    );
  });

  test('käynnistetään laskenta ja näytetään yhteenveto virheistä', async ({
    page,
  }) => {
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKUKOHDE',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 1,
          hakukohteitaKeskeytetty: 0,
        },
      },
      yhteenvetoResponse: {
        json: {
          tila: 'VALMIS',
          hakukohteet: [
            {
              hakukohdeOid: '1.2.246.562.20.00000000000000045105',
              tila: 'VIRHE',
              ilmoitukset: [
                {
                  tyyppi: 'VIRHE',
                  otsikko: 'Unknown Error',
                },
              ],
            },
          ],
        },
      },
    });

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
    await expect(page.getByText('Syy:Unknown Error')).toBeVisible();

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
    await mockValintalaskentaRun(page, {
      hakuOid: '1.2.246.562.29.00000000000000045102',
      tyyppi: 'HAKUKOHDE',
      seurantaResponse: {
        json: {
          jonosija: null,
          tila: 'VALMIS',
          hakukohteitaYhteensa: 1,
          hakukohteitaValmiina: 1,
          hakukohteitaKeskeytetty: 0,
        },
      },
      yhteenvetoResponse: {
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
      },
    });
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
