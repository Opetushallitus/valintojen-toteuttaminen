import { isNullish } from 'remeda';
import { isObject } from '../common';
import { toFinnishDate } from '../time-utils';
import { Language, TranslatedName } from './localization-types';
import { format } from 'date-fns';

export function translateName(
  translated: TranslatedName,
  userLanguage: Language = 'fi',
): string {
  const prop = userLanguage as keyof TranslatedName;
  const translation = translated[prop];
  if (translation && translation?.trim().length > 0) {
    return translated[prop] || '';
  } else if (translated.fi && translated.fi.trim().length > 0) {
    return translated.fi;
  } else if (translated.en && translated.en.trim().length > 0) {
    return translated.en;
  }
  return translated.sv || '';
}

export function isTranslatedName(value: unknown): value is TranslatedName {
  return (
    isObject(value) &&
    (typeof value?.fi === 'string' ||
      typeof value?.sv === 'string' ||
      typeof value?.en === 'string')
  );
}

export const DEFAULT_DATE_TIME_FORMAT = 'd.M.yyyy HH:mm:ss';
export const INPUT_DATE_FORMAT = 'dd.MM.yyyy';
export const INPUT_TIME_FORMAT = 'HH:mm';

export function toFormattedDateTimeString(
  value: number | Date | string | null | undefined,
  formatStr: string = DEFAULT_DATE_TIME_FORMAT,
): string {
  if (isNullish(value)) {
    return '';
  }
  try {
    const zonedDate = toFinnishDate(new Date(value));
    return format(zonedDate, formatStr);
  } catch (error) {
    console.warn(error);
    console.warn(
      'Caught error when trying to format date, returning empty string',
    );
    return '';
  }
}
