'use client';

import HttpBackend from 'i18next-http-backend';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getTranslations } from './translations';

export const createLocalization = () => {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      debug: true,
      fallbackLng: 'fi',
      preload: ['fi', 'sv', 'en'],
      lng: 'fi',
      backend: {
        loadPath: '{{lng}}',
        request: (options, url, payload, callback) => {
          getTranslations(url)
            .then((data) => {
              callback(null, { status: 200, data });
            })
            .catch(() => callback({ status: 404 }));
        },
      },
    });
  return i18n;
};
