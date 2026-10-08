import { TolgeeBase } from './tolgee-config';
import { Language } from './localization-types';

export const tolgee = TolgeeBase().init();

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  tolgee.changeLanguage(language);
}
