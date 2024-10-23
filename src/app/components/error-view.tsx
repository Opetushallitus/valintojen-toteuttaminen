'use client';
import { useEffect } from 'react';
import { FetchError, PermissionError } from '../lib/common';
import { useTranslations } from '../hooks/useTranslations';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';

const ErrorComponent = ({
  title,
  message,
  retry,
}: {
  title?: string;
  message?: React.ReactNode;
  retry?: () => void;
}) => {
  const { t } = useTranslations();
  return (
    <Stack gap={1} sx={{ margin: 1 }} alignItems="flex-start">
      {title && (
        <OphTypography variant="h1">{t('virhe.palvelin')}</OphTypography>
      )}
      {message && <OphTypography>{message}</OphTypography>}
      {retry && (
        <OphButton variant="contained" onClick={retry}>
          {t('virhe.uudelleenyritys')}
        </OphButton>
      )}
    </Stack>
  );
};

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
      <ErrorComponent
        title={t('virhe.palvelin')}
        message={
          <Stack gap={1}>
            <OphTypography>URL: {error.response.url}</OphTypography>
            <OphTypography>
              {t('virhe.virhekoodi')} {error.response.status}
            </OphTypography>
          </Stack>
        }
        retry={reset}
      />
    );
  } else if (error instanceof PermissionError) {
    return <ErrorComponent message={error.message} />;
  } else {
    return <ErrorComponent title={t('virhe.tuntematon')} retry={reset} />;
  }
}
