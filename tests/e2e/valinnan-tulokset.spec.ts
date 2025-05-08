import { test, expect, Page } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';
import { configuration } from '@/lib/configuration';
import HAUT from './fixtures/haut.json';

const hakukohdeOid = '1.2.246.562.20.00000000000000045105';
const valintatapajonoOid = '1224656220000000000000000123456';

async function goToValinnanTulokset(page: Page) {
  await page.clock.setFixedTime(new Date('2025-02-05T12:00:00'));

  await page.route(
    configuration.hakukohteenValinnanTulosUrl({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid,
    }),
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
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valinnan-tulokset',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
}

test.beforeEach(({ page }) => goToValinnanTulokset(page));

test.describe('Valinnan tulokset', () => {
  test('Näytä hakemusten tulokset', async ({ page }) => {
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
    await expect(rows).toHaveCount(4);

    const getEmptyRowColumns = (name: string) => [
      '',
      name,
      'Valitse...Ehdollinen valinta',
      'JulkaistavissaValitse...',
      '',
      '',
    ];

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
      getEmptyRowColumns('Purukumi Puru'),
      'td',
      false,
    );

    await checkRow(rows.nth(3), getEmptyRowColumns('Hui Haamu'), 'td', false);
  });
});
