import AxeBuilder from '@axe-core/playwright';
import { Locator, Page, Route, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { isFunction } from 'remeda';

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

export const expectTextboxValue = (value: string) => (locator: Locator) =>
  expect(locator.getByRole('textbox')).toHaveValue(value);

export const checkRow = async (
  row: Locator,
  expectedValues: Array<string | ((cell: Locator) => Promise<void>)>,
  cellType: 'th' | 'td' | 'th,td' = 'th,td',
  exact: boolean = true,
) => {
  const cells = row.locator(cellType);
  for (const [index, expectedValue] of expectedValues.entries()) {
    const cell = cells.nth(index);
    if (isFunction(expectedValue)) {
      await expectedValue(cell);
    } else {
      if (exact) {
        await expect(cell).toHaveText(expectedValue);
      } else {
        await expect(cell).toContainText(expectedValue);
      }
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
  within?: Locator,
) {
  const combobox = (within ?? page).getByRole('combobox', {
    name: new RegExp(`^${name}`),
  });

  await combobox.click();

  // Selectin listbox rendataan juuritasolle
  const listbox = page.locator('#select-menu').getByRole('listbox');

  await listbox
    .getByRole('option', { name: expectedOption, exact: true })
    .click();
  await expect(combobox).toContainText(expectedOption);
}

export async function mockDocumentProcess(
  page: Page,
  urlMatcher: (url: URL) => boolean,
  docId: string = 'doc_id',
) {
  await page.route(urlMatcher, async (route) => {
    await route.fulfill({
      json: { id: 'proc_id' },
    });
  });
  await page.route(
    (url) =>
      url.pathname.includes(
        '/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/proc_id',
      ),
    async (route) => {
      await route.fulfill({
        json: { dokumenttiId: docId, kokonaistyo: { valmis: true } },
      });
    },
  );
}

export const mockSeurantaProcess = async (
  page: Page,
  urlMatcher: (url: URL) => boolean,
) => {
  await page.route(urlMatcher, async (route) => {
    await route.fulfill({
      body: 'proc_uuid',
    });
  });
  await page.route(
    (url) =>
      url.pathname.includes(
        '/valintalaskentakoostepalvelu/resources/dokumentinseuranta/proc_uuid',
      ),
    async (route) => {
      await route.fulfill({
        json: {
          uuid: 'proc_uuid',
          valmis: true,
          dokumenttiId: null,
          virheilmoitukset: [],
          virheita: false,
        },
      });
    },
  );
};

export async function mockDocumentExport(
  page: Page,
  urlMatcher: (url: URL) => boolean,
) {
  await mockDocumentProcess(page, urlMatcher);
  await page.route(
    (url) =>
      url.pathname.includes(
        'valintalaskentakoostepalvelu/resources/dokumentit/lataa/doc_id',
      ),
    async (route) => {
      await route.fulfill({
        headers: {
          'content-type': 'application/octet-stream',
        },
        body: await readFile(path.join(__dirname, './fixtures/empty.xls')),
      });
    },
  );
}

export async function expectAlertTextVisible(page: Page, text: string) {
  const toast = page
    // MUI:n modaali asettaa aria-hidden="true" kaikille muille juuritason elementeille, eli myös ToastContainerille.
    // Täytyy käyttää includeHidden: true, jotta tämä toimii myös silloin kun modaalin on näkyvissä.
    .getByRole('alert', { includeHidden: true })
    .filter({ hasText: text });
  await expect(toast).toBeVisible();
}

export const startExcelImport = async (page: Page, within?: Locator) => {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await (within ?? page)
    .getByRole('button', {
      name: 'Tuo taulukkolaskennasta',
    })
    .click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, './fixtures/empty.xls'));
};

export const findTableColumnIndexByTitle = async (
  parent: Page | Locator,
  title: string,
) => {
  const headRowCells = parent.locator('tr th');
  const headRowLength = await headRowCells.count();

  for (let i = 0; i < headRowLength; ++i) {
    const content = await headRowCells.nth(i).textContent();
    if (content?.includes(title)) {
      return i;
    }
  }
  throw new Error(`Column with title "${title}" not found`);
};
