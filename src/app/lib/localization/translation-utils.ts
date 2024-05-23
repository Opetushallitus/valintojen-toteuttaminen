import { isObject } from '../common';
import { Language, TranslatedName } from './localization-types';

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
