import AxeBuilder from '@axe-core/playwright';
import { Locator, Page, expect } from '@playwright/test';

export const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  await expect(accessibilityScanResults.violations).toEqual([]);
};

export const expectAllSpinnersHidden = async (page: Page) => {
  const spinners = page.getByRole('progressbar');
  await expect(spinners).toHaveCount(0);
};

export const expectUrlParamToEqual = async (
  page: Page,
  paramName: string,
  value: string,
) => {
  await page.waitForURL(
    new RegExp(
      `(&|\\?)${paramName}=${value}|${encodeURIComponent(value)}(&|$)`,
    ),
  );
  const pageURL = page.url();
  const urlObj = new URL(pageURL);
  const param = urlObj.searchParams.get(paramName);
  await expect(param).toEqual(value);
};

export const checkRow = async (
  row: Locator,
  expectedValues: string[],
  cellType: 'th' | 'td' = 'td',
  exact: boolean = true,
) => {
  const cells = row.locator(cellType);
  for (const [index, value] of expectedValues.entries()) {
    if (exact) {
      await expect(cells.nth(index)).toHaveText(value);
    } else {
      await expect(cells.nth(index)).toContainText(value);
    }
  }
};

export const getHakukohdeNaviLinks = (page: Page) => {
  const nav = page.getByRole('navigation', { name: 'Hakukohdevalitsin' });
  return nav.getByRole('link');
};

export const getMuiCloseButton = (page: Page) =>
  page.getByRole('button', { name: 'Sulje' });
