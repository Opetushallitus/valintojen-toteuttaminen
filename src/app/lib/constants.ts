import { ophColors } from '@opetushallitus/oph-design-system';

export const PAGE_SIZES = [10, 20, 30, 50, 100];

export const DEFAULT_PAGE_SIZE = 30;

export const HAKU_SEARCH_PHRASE_DEBOUNCE_DELAY = 500;

export const INPUT_DEBOUNCE_DELAY = 400;

export const DEFAULT_BOX_BORDER = `2px solid ${ophColors.grey100}`;

export const OPH_ORGANIZATION_OID = '1.2.246.562.10.00000000001';

export const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
  defaultValue: '',
} as const;

export const NDASH = '\u2013';
