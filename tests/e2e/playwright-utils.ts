import AxeBuilder from '@axe-core/playwright';
import { Locator, Page, Route, expect } from '@playwright/test';
import path from 'path';
import cssEscape from 'css.escape';

export const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
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
  expect(param).toEqual(value);
};

export const checkRow = async (
  row: Locator,
  expectedValues: string[],
  cellType: 'th' | 'td' | 'th,td' = 'th,td',
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

export const getHakuNaviLinks = (page: Page) => {
  const nav = page.getByRole('navigation', { name: 'Haun näkymävalitsin' });
  return nav.getByRole('link');
};

export const getMuiCloseButton = (page: Page) =>
  page.getByRole('button', { name: 'Sulje' });

const FIXTURES_PATH = path.resolve(__dirname, './fixtures');

export const getFixturePath = (fileName: string) =>
  path.resolve(FIXTURES_PATH, fileName);

export const fixtureFromFile = (fileName: string) => {
  return (route: Route) => {
    return route.fulfill({ path: getFixturePath(fileName) });
  };
};

export async function selectOption(
  page: Page,
  name: string,
  expectedOption: string,
) {
  const combobox = page.getByRole('combobox', {
    name: new RegExp(`^${name}`),
  });
  const contentId = await combobox.getAttribute('aria-controls');
  await combobox.click();
  const contentIdSelector = contentId ? `#${cssEscape(contentId)}` : '';
  const listbox = page.locator(contentIdSelector);

  await listbox
    .getByRole('option', { name: expectedOption, exact: true })
    .click();
  await expect(combobox).toContainText(expectedOption);
}
