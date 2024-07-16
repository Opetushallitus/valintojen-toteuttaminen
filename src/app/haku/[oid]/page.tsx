'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { colors } from '@/app/theme';
import { ListAlt } from '@mui/icons-material';
import { styled } from '@/app/theme';

export default function HakuPage() {
  const { t } = useTranslations();

  const Container = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8, 4, 2),
    width: '70%',
  }));

  return (
    <Container>
      <ListAlt
        sx={{
          borderRadius: '45px',
          backgroundColor: colors.grey50,
          padding: '15px',
          boxSizing: 'content-box',
        }}
      />
      <h2>{t('hakukohde.valitse')}</h2>
    </Container>
  );
}
