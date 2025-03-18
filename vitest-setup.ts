import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('@/lib/localization/useTranslations', () => ({
  useTranslations: () => {
    return { t: (x: string) => x };
  },
}));
