'use client';
import { useEffect } from 'react';
import { FetchError, PermissionError } from '../lib/common';
import { useTranslations } from '../hooks/useTranslations';

export function ErrorView({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | FetchError;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });

  const { t } = useTranslations();

  if (error instanceof FetchError) {
    return (
      <>
        <h1>{t('virhe.palvelin')}</h1>
        <p>
          {t('virhe.virhekoodi')} {error.response.status}
        </p>
        <button onClick={() => reset()}>{t('virhe.uudelleenyritys')}</button>
      </>
    );
  } else if (error instanceof PermissionError) {
    return <p>{error.message}</p>;
  } else {
    return (
      <>
        <h1>{t('virhe.tuntematon')}</h1>
        <button onClick={() => reset()}>{t('virhe.uudelleenyritys')}</button>
      </>
    );
  }
}
