'use client';

import React from 'react';

import { Alert, styled, Box, Typography } from '@mui/material';
import { useToaster } from '@/app/hooks/useToaster';
import { useTranslations } from '../hooks/useTranslations';
import { colors } from '@opetushallitus/oph-design-system';

const ToasterContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '15vh',
  minWidth: '300px',
  position: 'absolute',
  top: '150px',
  right: '150px',
  zIndex: 2,
  pointerEvents: 'none',
}));

export const Toaster = () => {
  const { t } = useTranslations();
  const { toasts, removeToast } = useToaster();
  return (
    <ToasterContainer className="toaster">
      {toasts.map((toast) => (
        <Alert
          severity={toast.type}
          variant="filled"
          key={toast.key}
          onClose={() => removeToast(toast.key)}
        >
          <Typography sx={{ color: colors.white }}>
            {t(toast.message, toast.messageParams)}
          </Typography>
        </Alert>
      ))}
    </ToasterContainer>
  );
};
