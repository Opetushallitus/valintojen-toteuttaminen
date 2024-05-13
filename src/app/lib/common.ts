export type TranslatedName = {
  fi?: string;
  en?: string;
  sv?: string;
};

export enum Language {
  FI,
  EN,
  SV,
}

//TODO: match user's language
export function getTranslation(
  translated: TranslatedName,
  userLanguage: Language = Language.FI,
): string {
  const prop = Language[userLanguage].toLowerCase() as keyof TranslatedName;
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

export class FetchError extends Error {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FetchError.prototype);
    this.response = response;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTranslatedName(value: unknown): value is TranslatedName {
  return (
    isObject(value) &&
    (typeof value?.fi === 'string' ||
      typeof value?.sv === 'string' ||
      typeof value?.en === 'string')
  );
}

export const byProp = <
  T extends Record<string, string | number | TranslatedName>,
>(
  key: string,
  direction: 'asc' | 'desc' = 'asc',
  lng: Language,
) => {
  const asc = direction === 'asc';
  return (a: T, b: T) => {
    const aKey = a[key];
    const aProp = isTranslatedName(aKey) ? getTranslation(aKey, lng) : aKey;

    const bKey = b[key];
    const bProp = isTranslatedName(bKey) ? getTranslation(bKey, lng) : bKey;

    return aProp > bProp ? (asc ? 1 : -1) : bProp > aProp ? (asc ? -1 : 1) : 0;
  };
};
