'use client';

import { Alert, Box, Typography, Slide } from '@mui/material';
import { Toast, useToaster } from '@/hooks/useToaster';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';

const ToasterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 'auto',
  minWidth: '260px',
  maxWidth: '80%',
  position: 'fixed',
  top: theme.spacing(4),
  right: theme.spacing(4),
  bottom: 0,
  zIndex: 99999,
  pointerEvents: 'none',
}));

const InfoToast = ({
  toast,
  toastType,
}: {
  toast: Toast;
  toastType: 'error' | 'success';
}) => {
  const { t } = useTranslations();
  const { removeToast, toastEnter, toastLeave } = useToaster();
  return (
    <Slide direction="down" in={true}>
      <Alert
        severity={toastType}
        variant="filled"
        onClose={() => removeToast(toast.key)}
        onMouseEnter={() => toastEnter(toast.key)}
        onFocus={() => toastEnter(toast.key)}
        onMouseLeave={() => toastLeave(toast.key)}
        onBlur={() => toastLeave(toast.key)}
        sx={{
          pointerEvents: 'all',
          marginBottom: 2,
          whiteSpace: 'pre-line',
          overflowX: 'hidden',
          maxWidth: '90%',
        }}
      >
        <Typography sx={{ color: ophColors.white }}>
          {t({
            key: toast.message,
            defaultValue: toast.message,
            params: toast.messageParams,
          })}
        </Typography>
      </Alert>
    </Slide>
  );
};

export const Toaster = () => {
  const { toasts } = useToaster();

  const toastDisplay = (toast: Toast): React.ReactElement => {
    return <InfoToast toast={toast} toastType={toast.type} key={toast.key} />;
  };

  return (
    <ToasterContainer>
      {toasts.map((toast) => toastDisplay(toast))}
    </ToasterContainer>
  );
};
