'use client';
import React from 'react';
import { HomeOutlined as HomeOutlinedIcon } from '@mui/icons-material';
import { colors } from '@/app/theme';
import { IconButton } from './IconButton';
import { Typography } from '@mui/material';
import { PageContent } from './PageContent';

export type HeaderProps = {
  title?: React.ReactNode;
  isHome?: boolean;
};

export default function Header({
  title = 'Valintojen toteuttaminen',
  isHome = false,
}: HeaderProps) {
  return (
    <header
      style={{
        position: 'relative',
        backgroundColor: colors.white,
        width: '100%',
        border: `2px solid ${colors.grey100}`,
      }}
    >
      <PageContent
        sx={{
          paddingTop: (theme) => theme.spacing(2),
          paddingBottom: (theme) => theme.spacing(2),
          display: 'flex',
          textAlign: 'left',
          justifyContent: 'flex-start',
          alignItems: 'center',
          columnGap: (theme) => theme.spacing(2),
        }}
      >
        {!isHome && (
          <IconButton
            href="/"
            variant="outlined"
            startIcon={<HomeOutlinedIcon />}
            aria-label="Palaa etusivulle"
          />
        )}
        <Typography variant="h1">
          {!isHome ? '> ' : ''}
          {title}
        </Typography>
      </PageContent>
    </header>
  );
}
