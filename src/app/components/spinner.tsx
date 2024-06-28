'use client';
import { Box, CircularProgress, CircularProgressProps } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export const Spinner = (props: CircularProgressProps) => {
  const { t } = useTranslations();
  return <CircularProgress aria-label={t('yleinen.ladataan')} {...props} />;
};

export const FullSpinner = () => (
  <Box
    position="relative"
    left="0"
    top="0"
    minHeight="100px"
    height="100%"
    width="100%"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <Spinner />
  </Box>
);
