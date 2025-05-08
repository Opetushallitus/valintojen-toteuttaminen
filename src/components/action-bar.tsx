import { styled } from '@/lib/theme';
import { Box, Divider as MuiDivider } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '../lib/mui-utils';

export const Button = withDefaultProps(
  styled(OphButton)(({ theme }) => ({
    color: ophColors.white,
    '&:hover': {
      color: ophColors.white,
      backgroundColor: theme.palette.primary.light,
    },
    [theme.breakpoints.down('md')]: {
      '.MuiButton-icon': {
        display: 'none',
      },
    },
  })),
  { variant: 'text' },
) as typeof OphButton;

export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.primary.main,
  color: ophColors.white,
  padding: theme.spacing(1),
  alignItems: 'center',
  borderRadius: '3px',
  columnGap: theme.spacing(1),
}));

const Divider = withDefaultProps(
  styled(MuiDivider)({
    backgroundColor: ophColors.grey400,
    width: '2px',
  }),
  {
    orientation: 'vertical',
    flexItem: true,
  },
);

export const ActionBar = {
  Button,
  Container,
  Divider,
};
