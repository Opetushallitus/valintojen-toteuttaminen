'use client';
import { styled } from '@mui/material/styles';
import { Box, BoxProps } from '@mui/material';
import { ophColors } from '@/app/lib/theme';
import { DEFAULT_BOX_BORDER } from '../lib/constants';
import { withDefaultProps } from '../lib/mui-utils';

export const MainContainer = withDefaultProps(
  styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    border: DEFAULT_BOX_BORDER,
    backgroundColor: ophColors.white,
  })),
  {
    component: 'main',
  } as BoxProps,
) as typeof Box;
