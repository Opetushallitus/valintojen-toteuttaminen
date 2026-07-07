import { useEffect } from 'react';
import {
  FetchError,
  NotFoundError,
  OphErrorWithTitle,
  PermissionError,
} from '@/lib/common';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';
import NotFound from '@/app/not-found';

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
    <Stack spacing={1} sx={{ margin: 2 }} alignItems="flex-start">
      {title && (
        <OphTypography variant="h1" component="div">
          {title}
        </OphTypography>
      )}
      {message && <OphTypography component="div">{message}</OphTypography>}
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
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });

  const { t } = useTranslations();

  if (error instanceof NotFoundError) {
    return <NotFound />;
  } else if (error instanceof FetchError) {
    const { response } = error;
    if (
      response.status === 404 &&
      response.url.includes('/kouta-internal/haku/')
    ) {
      return <NotFound />;
    }
    return (
      <ErrorComponent
        title={t('virhe.palvelin')}
        message={
          <Stack spacing={1}>
            <OphTypography sx={{ overflowWrap: 'anywhere' }}>
              URL: {response.url}
            </OphTypography>
            <OphTypography>
              {t('virhe.virhekoodi')} {response.status}
            </OphTypography>
          </Stack>
        }
        retry={reset}
      />
    );
  } else if (error instanceof PermissionError) {
    return (
      <ErrorComponent
        title={t('virhe.kayttooikeudet')}
        message={t(error.message)}
      />
    );
  } else if (error instanceof OphErrorWithTitle) {
    return (
      <ErrorComponent
        title={t(error.title)}
        message={t(error.message)}
        retry={reset}
      />
    );
  } else {
    return <ErrorComponent title={t('virhe.tuntematon')} retry={reset} />;
  }
}
