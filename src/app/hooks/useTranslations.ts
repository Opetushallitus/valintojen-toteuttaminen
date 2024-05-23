import {
  Language,
  TranslatedName,
} from '../lib/localization/localization-types';
import { useTranslation } from 'react-i18next';
import { translateName } from '../lib/localization/translation-utils';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  const translateEntity = (translateable: TranslatedName) => {
    return translateName(translateable, i18n.language as Language);
  };
  return { t, translateEntity };
};
