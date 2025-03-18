'use client';

import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { TolgeeBase } from './tolgee-config';
import { Language } from './localization-types';
import { fi, sv } from 'date-fns/locale';

const initLocalization = () => {
  registerLocale('fi', fi);
  registerLocale('sv', sv);
  setDefaultLocale('fi');
  return TolgeeBase().init();
};

export const tolgee = initLocalization();

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  setDefaultLocale(language);
  tolgee.changeLanguage(language);
}
