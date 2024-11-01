'use client';
import { HomeOutlined as HomeOutlinedIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { PageContent } from './page-content';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '../hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '../lib/constants';
import { styled } from '@/app/lib/theme';
import { responsivePadding } from '../lib/responsive-padding';

export type HeaderProps = {
  title?: React.ReactNode;
  isHome?: boolean;
};

const HeaderContent = styled(PageContent)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  columnGap: theme.spacing(2),
  ...responsivePadding(theme),
}));

export function Header({ title, isHome = false }: HeaderProps) {
  const { t } = useTranslations();

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        backgroundColor: ophColors.white,
        width: '100%',
        borderBottom: DEFAULT_BOX_BORDER,
      }}
    >
      <HeaderContent>
        {!isHome && (
          <OphButton
            href="/"
            variant="outlined"
            startIcon={<HomeOutlinedIcon />}
            aria-label={t('yleinen.palaa-etusivulle')}
          />
        )}
        <Typography variant="h2" component="h1">
          {isHome ? '' : '> '}
          {title ?? t('otsikko')}
        </Typography>
      </HeaderContent>
    </Box>
  );
}
