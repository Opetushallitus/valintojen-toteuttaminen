'use server';

import { configuration } from '../configuration';
import { client } from '../http-client';
import { Language } from './localization-types';

export const getTranslations = async (lng: Language) => {
  const translations = {};
  const { data } = await client.get(`${configuration.lokalisaatioUrl}${lng}`);

  console.log(data);

  for (const translation of data) {
    translations[translation.key] = translation.value;
  }

  console.log(translations);
  console.log('TRANSLATIONS ' + lng.toString());

  return translations;
};
