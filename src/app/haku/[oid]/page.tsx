'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { colors } from '@/app/theme';
import { ListAlt } from '@mui/icons-material';
import { styled } from '@mui/material';

export default function HakuPage() {
  const { t } = useTranslations();

  const Container = styled('div')({
    textAlign: 'center',
    padding: '5rem 2rem 1rem',
    width: '70%',
  });

  return (
    <Container>
      <ListAlt
        sx={{
          borderRadius: '45px',
          backgroundColor: colors.grey50,
          padding: '15px',
        }}
      />
      <h2>{t('hakukohde.valitse')}</h2>
    </Container>
  );
}
