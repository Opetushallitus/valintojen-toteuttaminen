'use client';
import { ButtonOwnProps } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import NextLink, { LinkProps } from 'next/link';
import { Open_Sans } from 'next/font/google';
import * as React from 'react';

const LinkBehaviour = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkBehaviour(props, ref) {
    return <NextLink ref={ref} {...props} />;
  },
);

const colors = {
  grey900: '#1D1D1D',
  grey700: '#4C4C4C',
  grey600: '#5D5D5D',
  grey500: '#B2B2B2',
  grey400: '#CCCCCC',
  grey200: '#E6E6E6',
  grey50: '#F5F7F9',

  white: '#FFFFFF',
  black: '#000000',

  blue1: '#000066',
  blue2: '#0033CC',
  blue3: '#0041DC',
  cyan1: '#006699',
  cyan2: '#66CCCC',
  cyan3: '#99FFFF',
  lightBlue1: '#82D4FF',
  lightBlue2: '#C1EaFF',
};

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: openSans.style.fontFamily,
  },
  palette: {
    primary: {
      main: colors.blue2,
      light: colors.blue3,
      dark: colors.blue1,
      contrastText: colors.white,
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: '600',
        },
        contained: ({ ownerState, theme }) => {
          return {
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: getColorByName(ownerState.color, theme, 'light'),
            },
            '&:active': {
              backgroundColor: getColorByName(ownerState.color, theme, 'dark'),
            },
          };
        },
        outlined: ({ ownerState, theme }) => {
          return {
            color: getColorByName(ownerState.color, theme, 'main'),
            borderRadius: '2px',
            border: `3px solid ${getColorByName(ownerState.color, theme, 'main')}`,
            '&:hover': {
              borderWidth: '3px',
              backgroundColor: colors.white,
              color: getColorByName(ownerState.color, theme, 'light'),
              borderColor: getColorByName(ownerState.color, theme, 'light'),
            },
            '&:active': {
              borderWidth: '3px',
              backgroundColor: colors.white,
              color: getColorByName(ownerState.color, theme, 'dark'),
              borderColor: getColorByName(ownerState.color, theme, 'dark'),
            },
          };
        },
        text: ({ ownerState, theme }) => {
          return {
            color: getColorByName(ownerState.color, theme, 'main'),
            '&:hover': {
              color: getColorByName(ownerState.color, theme, 'light'),
            },
            '&:active': {
              color: getColorByName(ownerState.color, theme, 'dark'),
            },
          };
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
        },
      },
    },
  },
});

function getColorByName(
  colorName: ButtonOwnProps['color'],
  customTheme: typeof theme,
  mode: 'main' | 'light' | 'dark',
) {
  return colorName === 'inherit'
    ? 'inherit'
    : customTheme.palette[colorName ?? 'primary'][mode];
}

export default theme;
