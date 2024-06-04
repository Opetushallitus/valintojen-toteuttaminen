import { test, expect, Page, Locator } from '@playwright/test';

const getTableRows = (loc: Page | Locator) => loc.locator('tbody tr');

test('shows only organizations user has permissions to', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      const user = {
        isAdmin: false,
        organisaatiot: [
          {
            organisaatioOid: '1.2.246.562.10.79559059674',
            kayttooikeudet: [
              { palvelu: 'VALINTOJENTOTEUTTAMINEN', oikeus: 'READ' },
            ],
          },
        ],
      };
      await route.fulfill({ body: JSON.stringify(user), contentType: 'json' });
    },
  );
  const tableRows = getTableRows(page);
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows).toContainText(
    'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
});
