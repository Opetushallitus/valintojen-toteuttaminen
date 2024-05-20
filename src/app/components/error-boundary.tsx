'use client';
import { useEffect } from 'react';
import { FetchError } from '../lib/common';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | FetchError;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });

  const { t } = useTranslation();

  if (error instanceof FetchError) {
    return (
      <>
        <h1>{t('error.server')}</h1>
        <p>
          {t('error.code')} {error.response.status}
        </p>
        <button onClick={() => reset()}>{t('error.retry')}</button>
      </>
    );
  } else {
    return (
      <>
        <h1>{t('error.unknown')}</h1>
        <button onClick={() => reset()}>{t('error.retry')}</button>
      </>
    );
  }
}
