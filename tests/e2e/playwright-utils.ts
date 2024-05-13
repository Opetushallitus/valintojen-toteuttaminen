import AxeBuilder from '@axe-core/playwright';
import { Page, expect } from '@playwright/test';

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
  const pageURL = await page.url();
  const urlObj = new URL(pageURL);
  const param = urlObj.searchParams.get(paramName);
  await expect(param).toEqual(value);
};
