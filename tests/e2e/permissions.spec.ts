import { test, expect, Page, Locator } from '@playwright/test';

const getTableRows = (loc: Page | Locator) => loc.locator('tbody tr');

test('Näyttää vain organisaatiot joille käyttäjällä on oikeus', async ({
  page,
}) => {
  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      const user = {
        organisaatiot: [
          {
            organisaatioOid: '1.2.246.562.10.79559059674',
            kayttooikeudet: [
              { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'READ' },
            ],
          },
        ],
      };
      await route.fulfill({ json: user });
    },
  );
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
  const tableRows = getTableRows(page);
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows).toContainText(
    'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
});

test('Näyttää virheviestin kun käyttäjällä ei ole oikeuksia', async ({
  page,
}) => {
  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      const user = {
        organisaatiot: [
          {
            organisaatioOid: '1.2.246.562.10.79559059674',
            kayttooikeudet: [{ palvelu: 'PALVELU', oikeus: 'READ' }],
          },
        ],
      };
      await route.fulfill({ json: user });
    },
  );
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
  await expect(page.getByText('Ei riittäviä käyttöoikeuksia.')).toBeVisible();
});
