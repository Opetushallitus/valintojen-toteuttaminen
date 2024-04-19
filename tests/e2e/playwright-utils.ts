import AxeBuilder from '@axe-core/playwright';
import { Page, expect } from '@playwright/test';

export const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  await expect(accessibilityScanResults.violations).toEqual([]);
};
