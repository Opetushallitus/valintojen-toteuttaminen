'use client';

import React from 'react';

import { Alert, styled, Box, Typography, Slide } from '@mui/material';
import { Toast, useToaster } from '@/app/hooks/useToaster';
import { useTranslations } from '../hooks/useTranslations';
import { Button, colors } from '@opetushallitus/oph-design-system';
import theme from '../theme';

const ToasterContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: 'auto',
  minWidth: '260px',
  maxWidth: '80%',
  position: 'absolute',
  top: '150px',
  right: '150px',
  zIndex: 2,
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
        sx={{ pointerEvents: 'all', marginBottom: theme.spacing(2) }}
      >
        <Typography sx={{ color: colors.white }}>
          {t(toast.message, toast.messageParams)}
        </Typography>
      </Alert>
    </Slide>
  );
};

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
          marginBottom: theme.spacing(2),
          maxWidth: '500px',
        }}
      >
        <Typography sx={{ color: colors.white }}>
          {t(toast.message, toast.messageParams)}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            columnGap: theme.spacing(1),
            marginTop: theme.spacing(1),
          }}
        >
          <Button variant="outlined" onClick={() => removeToast(toast.key)}>
            {t('yleinen.peruuta')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              removeToast(toast.key);
              if (toast.confirmFn) {
                toast.confirmFn();
              }
            }}
          >
            {t('lomake.jatka')}
          </Button>
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
