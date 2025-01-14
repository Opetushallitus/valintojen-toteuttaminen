'use client';

import FetchBackend from 'i18next-fetch-backend';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isDev } from '../configuration';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { fi, sv } from 'date-fns/locale';

export const createLocalization = () => {
  registerLocale('fi', fi);
  registerLocale('sv', sv);
  setDefaultLocale('fi');
  i18n
    .use(FetchBackend)
    .use(initReactI18next)
    .init({
      debug: isDev,
      fallbackLng: false,
      preload: ['fi', 'sv', 'en'],
      lng: 'fi',
      backend: {
        loadPath: '/valintojen-toteuttaminen/lokalisaatio?lng={{lng}}',
      },
    });
  return i18n;
};
