import { isObject } from '../common';
import { Language, TranslatedName } from './localization-types';
import { format, toZonedTime } from 'date-fns-tz';

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

export function toFormattedDateTimeString(value: number | Date): string {
  try {
    const zonedDate = toZonedTime(new Date(value), 'Europe/Helsinki');
    return format(zonedDate, 'd.M.yyyy HH:mm', {
      timeZone: 'Europe/Helsinki',
    });
  } catch (error) {
    console.warn(
      'Caught error when trying to format date, returning empty string',
    );
    return '';
  }
}
