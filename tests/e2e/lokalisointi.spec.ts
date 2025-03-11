import { test, expect } from '@playwright/test';

test.describe('Lokalisointi', () => {
  test('Kääntää sivun suomeksi', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
    await expect(page.getByRole('combobox', { name: 'Tila' })).toContainText(
      'Julkaistu',
    );
    await expect(page.getByText('Haut')).toBeVisible();
    await expect(page.getByText('haut.otsikko')).toBeHidden();
  });

  test('Kääntää sivun englanniksi', async ({ page }) => {
    await page.route(
      '*/**/oppijanumerorekisteri-service/henkilo/current/asiointiKieli',
      async (route) => {
        await route.fulfill({ body: 'en', contentType: 'text' });
      },
    );
    await page.goto('/');
    await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
    await expect(page.getByRole('combobox', { name: 'State' })).toContainText(
      'Published',
    );
    await expect(page.getByText('Haut')).toBeHidden();
    await expect(page.getByText('haku.otsikko')).toBeVisible();
  });

  test('Kääntää sivun ruotsiksi', async ({ page }) => {
    await page.route(
      '*/**/oppijanumerorekisteri-service/henkilo/current/asiointiKieli',
      async (route) => {
        await route.fulfill({ body: 'sv', contentType: 'text' });
      },
    );
    await page.goto('/');
    await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
    await expect(
      page.getByRole('combobox', { name: 'yleinen.tila' }),
    ).toContainText('Publicerad');
    await expect(page.getByText('Haut')).toBeHidden();
    await expect(page.getByText('haku.otsikko')).toBeVisible();
  });
});
