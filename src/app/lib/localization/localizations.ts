'use client';

import HttpBackend from 'i18next-http-backend';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isDev } from '../configuration';

export const createLocalizationProvider = () => {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      debug: isDev,
      fallbackLng: false,
      preload: ['fi', 'sv', 'en'],
      lng: 'fi',
      backend: {
        loadPath: '{{lng}}',
        request: (
          options: [],
          url: string,
          payload: unknown,
          callback: (a: unknown, b?: unknown) => void,
        ) => {
          fetch(`/valintojen-toteuttaminen/lokalisaatio?lng=${url}`)
            .then(async (response) => {
              const translations = await response.json();
              callback(null, { status: 200, data: translations });
            })
            .catch(() => callback({ status: 404 }));
        },
      },
    });
  return i18n;
};
