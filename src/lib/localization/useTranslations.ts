'use client';
import { Language, TranslatedName } from './localization-types';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { translateName } from './translation-utils';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  const translateEntity = useCallback(
    (translateable?: TranslatedName) => {
      return translateable
        ? translateName(translateable, i18n.language as Language)
        : '';
    },
    [i18n.language],
  );

  return { t, translateEntity, language: i18n.language as Language, i18n };
};
