'use client';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { withDefaultProps } from '@/app/theme';

export const MainContainer = withDefaultProps(
  styled(Box)({
    padding: '2rem',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    backgroundColor: 'white',
  }),
  {
    component: 'main',
  },
);
