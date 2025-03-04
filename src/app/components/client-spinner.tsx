'use client';

import { useTranslations } from '@/app/lib/localization/useTranslations';
import { CircularProgress, CircularProgressProps } from '@mui/material';
import { FullSpinner } from './full-spinner';

export const ClientSpinner = (props: CircularProgressProps) => {
  const { t } = useTranslations();
  return <CircularProgress aria-label={t('yleinen.ladataan')} {...props} />;
};

export const FullClientSpinner = () => {
  const { t } = useTranslations();
  return <FullSpinner ariaLabel={t('yleinen.ladataan')} />;
};
