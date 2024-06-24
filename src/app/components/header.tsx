'use client';
import React from 'react';
import { HomeOutlined as HomeOutlinedIcon } from '@mui/icons-material';
import { colors } from '@/app/theme';
import { Typography } from '@mui/material';
import { PageContent } from './page-content';
import { Button } from '@opetushallitus/oph-design-system';
import { useTranslations } from '../hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '../lib/constants';

export type HeaderProps = {
  title?: React.ReactNode;
  isHome?: boolean;
};

export default function Header({ title, isHome = false }: HeaderProps) {
  const { t } = useTranslations();
  return (
    <header
      style={{
        position: 'relative',
        backgroundColor: colors.white,
        width: '100%',
        border: DEFAULT_BOX_BORDER,
      }}
    >
      <PageContent
        sx={{
          paddingY: 2,
          display: 'flex',
          alignItems: 'center',
          columnGap: 2,
        }}
      >
        {!isHome && (
          <Button
            href="/"
            variant="outlined"
            startIcon={<HomeOutlinedIcon />}
            aria-label={t('yleinen.palaa-etusivulle')}
          />
        )}
        <Typography variant="h1">
          {isHome ? '' : '> '}
          {title ?? t('otsikko')}
        </Typography>
      </PageContent>
    </header>
  );
}
