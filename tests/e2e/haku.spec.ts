import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  getHakukohdeNaviLinks,
  mockOneOrganizationHierarchy,
} from './playwright-utils';
import { VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY } from '@/lib/permissions';

test('Haku-sivun saavutettavuus', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('Hakukohde suodatin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
    );
  });

  test('Suodattaa nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Natural Sciences');
    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Natural Sciences and Mathematics',
    );
    await hakuInput.fill('Sustainable Urban');
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });

  test('Suodattaa järjestäjän nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Tekniikan ja luonnontieteiden tiedekunta');
    await expect(getHakukohdeNaviLinks(page)).toHaveCount(2);
  });

  test('Suodattaa hakukohteen oidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('1.2.246.562.20.00000000000000045104');

    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Computing and Electrical Engineering',
    );
  });

  test('Suodattaa "On valintakoe"-tiedolla', async ({ page }) => {
    await page.getByRole('button', { name: 'Lisää hakuehtoja' }).click();
    await page.getByLabel('On valintakoe').click();

    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });

  test('Suodattaa "Valintalaskenta suorittamatta" -tiedolla', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Lisää hakuehtoja' }).click();
    await page.getByLabel('Valintalaskenta suorittamatta').click();

    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await expect(hakukohdeNavItems).toHaveCount(2);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Computing and Electrical Engineering',
    );
    await expect(hakukohdeNavItems.last()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });

  test('Suodattaa "Varasijatäyttö päättämättä" -tiedolla', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2022-02-02T11:59:00+02:00'));
    const hakukohdeNavItems = getHakukohdeNaviLinks(page);
    await page.getByRole('button', { name: 'Lisää hakuehtoja' }).click();
    await page.getByLabel('Varasijatäyttö päättämättä').click();
    await expect(hakukohdeNavItems).toHaveCount(1);
    await expect(hakukohdeNavItems.first()).toContainText(
      'Finnish MAOL competition route, Computing and Electrical Engineering',
    );
    await page.clock.setFixedTime(new Date('2022-02-02T12:01:00+02:00'));
    await page.getByLabel('Varasijatäyttö päättämättä').click();
    await expect(hakukohdeNavItems).toHaveCount(3);
    await page.getByLabel('Varasijatäyttö päättämättä').click();
    await expect(hakukohdeNavItems).toHaveCount(0);
  });
});

test('Näyttää virheilmoituksen oppilaitos-virkailijalle, jos ei voida näyttää yhtään hakukohdetta', async ({
  page,
}) => {
  const ORGANIZATION_OID = 'ei-oikeuksia-hakukohteisiin';
  await mockOneOrganizationHierarchy(page, {
    oid: ORGANIZATION_OID,
  });

  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      await route.fulfill({
        json: {
          organisaatiot: [
            {
              organisaatioOid: ORGANIZATION_OID,
              kayttooikeudet: [
                {
                  palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
                  oikeus: 'CRUD',
                },
              ],
            },
          ],
        },
      });
    },
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expect(page.getByText('Hakukohteita ei löytynyt')).toBeVisible();
  await expect(
    page.getByText(
      'Tällä haulla ei ole käyttäjätunnuksellesi kuuluvia hakukohteita.',
    ),
  ).toBeVisible();
});
