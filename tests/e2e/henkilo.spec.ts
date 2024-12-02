import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  selectOption,
} from './playwright-utils';
import HAKENEET from './fixtures/hakeneet.json';
import POSTI_00100 from './fixtures/posti_00100.json';
import HAKEMUKSEN_VALINTALASKENTA_TULOKSET from './fixtures/hakemuksen-valintalaskenta-tulokset.json';
import HAKEMUKSEN_SIJOITTELU_TULOKSET from './fixtures/hakemuksen-sijoittelu-tulokset.json';
import { configuration } from '@/app/lib/configuration';
import { hakemusValinnanTulosFixture } from './fixtures/hakemus-valinnan-tulos';
import {
  IlmoittautumisTila,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { TuloksenTila } from '@/app/lib/types/laskenta-types';
import { forEachObj, isShallowEqual } from 'remeda';

const VALINNAN_TULOS_RESULT = hakemusValinnanTulosFixture({
  hakukohdeOid: '1.2.246.562.20.00000000000000045105',
  hakemusOid: '1.2.246.562.11.00000000000001796027',
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
      json: HAKENEET.filter(
        ({ oid }) => oid === '1.2.246.562.11.00000000000001793706',
      ),
    });
  });
  await page.route(
    configuration.hakemuksenLasketutValinnanvaiheetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) =>
      route.fulfill({
        json: HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
      }),
  );
  await page.route(
    configuration.hakemuksenSijoitteluajonTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) => {
      return route.fulfill({
        json: HAKEMUKSEN_SIJOITTELU_TULOKSET,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) => {
      return route.fulfill({
        json: VALINNAN_TULOS_RESULT,
      });
    },
  );
});

test('Henkiloittain page accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/henkilo/1.2.246.562.11.00000000000001796027',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Henkilö-search and navigation works', async ({ page }) => {
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

test('Displays selected henkilö info with hakutoive but without valintalaskenta or sijoittelu results', async ({
  page,
}) => {
  await page.route(
    configuration.hakemuksenLasketutValinnanvaiheetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: '1.2.246.562.11.00000000000001796027',
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
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: '1.2.246.562.11.00000000000001796027',
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

  await expect(
    page.getByText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
    }),
  ).toBeVisible();

  await expect(page.getByText('Ei valintalaskennan tuloksia')).toBeHidden();
  await page.getByRole('button', { name: 'Näytä hakutoiveen tiedot' }).click();
  await expect(page.getByText('Ei valintalaskennan tuloksia')).toBeVisible();
});

test('Displays selected henkilö hakutoiveet with laskenta and valinta results', async ({
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
    'Vastaanottanut sitovastiMuokkaa',
    'Ei ilmoittautunutMuokkaa',
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

test('Displays selected henkilö hakutoiveet with laskenta results only', async ({
  page,
}) => {
  await page.route(
    configuration.hakemuksenSijoitteluajonTuloksetUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakemusOid: '1.2.246.562.11.00000000000001796027',
    }),
    (route) => {
      return route.fulfill({
        status: 404,
      });
    },
  );

  await page.route(
    configuration.hakemuksenValinnanTulosUrl({
      hakemusOid: '1.2.246.562.11.00000000000001796027',
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

test('Shows valintalaskenta edit modal with info', async ({ page }) => {
  await initSaveModal(page, 'valintalaskenta');

  const valintalaskentaMuokkausModal = page.getByRole('dialog', {
    name: 'Muokkaa valintalaskentaa',
  });

  await expect(valintalaskentaMuokkausModal).toBeVisible();
  await expect(
    valintalaskentaMuokkausModal.getByLabel('Hakija', { exact: true }),
  ).toHaveText('Nukettaja Ruhtinas');
  await expect(valintalaskentaMuokkausModal.getByLabel('Hakutoive')).toHaveText(
    '1. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) \u2013 Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
  );
  await expect(
    valintalaskentaMuokkausModal.getByLabel('Valintatapajono'),
  ).toHaveText('Jono 2');
  await expect(
    valintalaskentaMuokkausModal.getByLabel('Järjestyskriteeri'),
  ).toContainText(
    '2. asteen peruskoulupohjainen peruskaava + Kielitaidon riittävyys - 2 aste, pk ja yo 2021',
  );
  await expect(valintalaskentaMuokkausModal.getByLabel('Pisteet')).toHaveValue(
    '13',
  );
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

test('Sends valintalaskenta save request with right values and shows success notification', async ({
  page,
}) => {
  const muokkausUrl = configuration.jarjestyskriteeriMuokkausUrl({
    hakemusOid: '1.2.246.562.11.00000000000001796027',
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

  await Promise.all([
    saveButton.click(),
    page.waitForRequest((request) => {
      return (
        request.url() === muokkausUrl &&
        isShallowEqual(request.postDataJSON(), {
          arvo: '12',
          tila: TuloksenTila.HYLATTY,
          selite: 'Syy muokkaukselle',
        })
      );
    }),
  ]);

  await expect(
    page.getByText('Valintalaskennan tietojen tallentaminen onnistui'),
  ).toBeVisible();
});

test('Show notification on valintalaskenta save error', async ({ page }) => {
  await page.route(
    configuration.jarjestyskriteeriMuokkausUrl({
      hakemusOid: '1.2.246.562.11.00000000000001796027',
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
  await expect(
    page.getByText('Valintalaskennan tietojen tallentaminen epäonnistui'),
  ).toBeVisible();
});

test('Shows valinta edit modal with info', async ({ page }) => {
  await initSaveModal(page, 'valinta');

  const valintaMuokkausModal = page.getByRole('dialog', {
    name: 'Muokkaa valintaa',
  });

  await expect(valintaMuokkausModal).toBeVisible();

  await expect(
    valintaMuokkausModal.getByLabel('Hakija', { exact: true }),
  ).toHaveText('Nukettaja Ruhtinas');

  await expect(valintaMuokkausModal.getByLabel('Hakutoive')).toHaveText(
    '1. Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs) \u2013 Tampereen yliopisto, Rakennetun ympäristön tiedekunta',
  );

  await expect(
    valintaMuokkausModal.getByLabel('Vastaanoton tila'),
  ).toContainText('Vastaanottanut sitovasti');
  await expect(
    valintaMuokkausModal.getByLabel('Ilmoittautumisen tila'),
  ).toContainText('Ei ilmoittautunut');
});

test('Sends valinta save request with right info and shows success notification', async ({
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

  await Promise.all([
    saveButton.click(),
    page.waitForRequest((request) => {
      if (request.url() === muokkausUrl) {
        const postData = request.postDataJSON();
        const newValinnanTulos = postData[0];
        let result = true;
        forEachObj(
          {
            ...VALINNAN_TULOS_BASE,
            vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
            ilmoittautumistila: IlmoittautumisTila.LASNA_KOKO_LUKUVUOSI,
          },
          (value, key) => {
            if (value !== newValinnanTulos[key]) {
              result = false;
            }
          },
        );
        return result;
      }
      return false;
    }),
  ]);

  await expect(
    page.getByText('Valinnan tietojen tallentaminen onnistui'),
  ).toBeVisible();
});

test('Show notification on valinta save error', async ({ page }) => {
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
  await expect(
    page.getByText(
      'Valinnan tietojen tallentaminen epäonnistui\nVirhe backendista',
    ),
  ).toBeVisible();
});
