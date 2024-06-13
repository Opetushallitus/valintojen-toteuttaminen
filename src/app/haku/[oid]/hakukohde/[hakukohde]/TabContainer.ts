import { styled } from '@mui/material';

export const TabContainer = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  overflowX: 'auto',
}));
