'use client';
import {
  Language,
  TranslatedName,
} from '../lib/localization/localization-types';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { translateName } from '../lib/localization/translation-utils';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  const translateEntity = useMemo(
    () => (translateable: TranslatedName) => {
      return translateName(translateable, i18n.language as Language);
    },
    [i18n],
  );
  return { t, translateEntity };
};
