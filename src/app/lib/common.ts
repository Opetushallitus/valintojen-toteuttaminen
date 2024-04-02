export type TranslatedName = {
  fi?: string,
  en?: string,
  sv?: string
}

export enum Language {
  FI, EN, SV
}

//TODO: match user's language
export function getTranslation(translated: TranslatedName, userLanguage: Language = Language.FI): string {
  const prop = Language[userLanguage].toLowerCase() as keyof TranslatedName;
  if (translated[prop] && translated[prop]?.trim().length > 0) {
    return translated[prop] || '';
  } else if (translated.fi && translated.fi.trim().length > 0) {
    return translated.fi;
  } else if (translated.sv && translated.sv.trim().length > 0) {
    return translated.sv;
  }
  return translated.en || '';
}

