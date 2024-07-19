'use client';

import React from 'react';

import { Alert, styled, Box, Typography, Slide } from '@mui/material';
import { useToaster } from '@/app/hooks/useToaster';
import { useTranslations } from '../hooks/useTranslations';
import { colors } from '@opetushallitus/oph-design-system';
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

export const Toaster = () => {
  const { t } = useTranslations();
  const { toasts, removeToast, toastEnter, toastLeave } = useToaster();
  return (
    <ToasterContainer>
      {toasts.map((toast) => (
        <Slide direction="down" in={true} key={toast.key}>
          <Alert
            severity={toast.type}
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
      ))}
    </ToasterContainer>
  );
};
