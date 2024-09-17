'use client';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { colors } from '@/app/theme';
import { DEFAULT_BOX_BORDER } from '../lib/constants';
import { withDefaultProps } from '../lib/mui-utils';

export const MainContainer = withDefaultProps(
  styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    border: DEFAULT_BOX_BORDER,
    backgroundColor: colors.white,
  })),
  {
    component: 'main',
  },
);
