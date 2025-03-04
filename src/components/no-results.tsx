import { Box, Typography } from '@mui/material';
import { IconCircle } from './icon-circle';
import { FolderOutlined } from '@mui/icons-material';
import { styled } from '../lib/theme';
import React from 'react';

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  margin: theme.spacing(4),
  gap: theme.spacing(2),
}));

export const NoResults = ({
  text,
  icon,
}: {
  text: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <Wrapper>
      <IconCircle>{icon ?? <FolderOutlined />}</IconCircle>
      <Typography component="div" variant="h3" sx={{ fontWeight: 'normal' }}>
        {text}
      </Typography>
    </Wrapper>
  );
};
