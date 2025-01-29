'use client';

import { Alert, styled, Box, Typography, Slide } from '@mui/material';
import { Toast, useToaster } from '@/app/hooks/useToaster';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';

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
  const { t, i18n } = useTranslations();
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
        sx={{ pointerEvents: 'all', marginBottom: 2, whiteSpace: 'pre' }}
      >
        <Typography sx={{ color: ophColors.white }}>
          {i18n.exists(toast.message)
            ? t(toast.message, toast.messageParams)
            : toast.message}
        </Typography>
      </Alert>
    </Slide>
  );
};

// TODO: Korvaa ConfirmationModalDialog-komponentilla
const ConfirmToast = ({ toast }: { toast: Toast }) => {
  const { t } = useTranslations();
  const { removeToast } = useToaster();
  return (
    <Slide direction="down" in={true}>
      <Alert
        severity="warning"
        variant="filled"
        sx={{
          pointerEvents: 'all',
          marginBottom: 2,
          maxWidth: '500px',
          backgroundColor: ophColors.white,
          border: `2px solid ${ophColors.orange4}`,
          color: ophColors.orange4,
        }}
      >
        <Typography sx={{ color: ophColors.black }}>
          {t(toast.message, toast.messageParams)}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            columnGap: 1,
            marginTop: 1,
          }}
        >
          <OphButton
            variant="outlined"
            sx={{ backgroundColor: ophColors.white }}
            onClick={() => removeToast(toast.key)}
          >
            {t('yleinen.peruuta')}
          </OphButton>
          <OphButton
            variant="contained"
            onClick={() => {
              removeToast(toast.key);
              if (toast.confirmFn) {
                toast.confirmFn();
              }
            }}
          >
            {t('lomake.jatka')}
          </OphButton>
        </Box>
      </Alert>
    </Slide>
  );
};

export const Toaster = () => {
  const { toasts } = useToaster();

  const toastDisplay = (toast: Toast): React.ReactElement => {
    if (toast.type === 'confirm') {
      return <ConfirmToast toast={toast} key={toast.key} />;
    }
    return <InfoToast toast={toast} toastType={toast.type} key={toast.key} />;
  };

  return (
    <ToasterContainer>
      {toasts.map((toast) => toastDisplay(toast))}
    </ToasterContainer>
  );
};
